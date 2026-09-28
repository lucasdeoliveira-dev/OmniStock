package com.omnistock.service;

import com.omnistock.dto.backup.BackupRequestDTO;
import com.omnistock.enums.TipoManutencao;
import com.omnistock.model.Backup;
import com.omnistock.model.Manutencao;
import com.omnistock.repository.BackupRepository;
import net.lingala.zip4j.ZipFile;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.model.enums.AesKeyStrength;
import net.lingala.zip4j.model.enums.EncryptionMethod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

/**
 * Executa o processo de backup de fato, em uma thread separada (@Async).
 * Fica isolado do BackupService para que o proxy de @Async do Spring seja respeitado
 * (chamadas via "this." dentro da mesma classe não são interceptadas pelo proxy).
 */
@Service
public class BackupExecutionWorker {

    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final BackupRepository backupRepository;
    private final ManutencaoService manutencaoService;
    private final EmailService emailService;

    @Value("${DB_HOST:localhost}")
    private String dbHost;

    @Value("${DB_PORT:5432}")
    private String dbPort;

    @Value("${DB_NAME:omnistock}")
    private String dbName;

    @Value("${DB_USER:omnistock}")
    private String dbUser;

    @Value("${DB_PASSWORD:omnistock}")
    private String dbPassword;

    @Value("${omnistock.backup.dir:/app/backups}")
    private String backupDirPadrao;

    public BackupExecutionWorker(BackupRepository backupRepository, ManutencaoService manutencaoService,
                                  EmailService emailService) {
        this.backupRepository = backupRepository;
        this.manutencaoService = manutencaoService;
        this.emailService = emailService;
    }

    @Async
    public void executar(Long backupId, BackupRequestDTO dto) {
        String diretorio = (dto.caminhoDestino() != null && !dto.caminhoDestino().isBlank())
                ? dto.caminhoDestino()
                : backupDirPadrao;

        try {
            atualizarEtapa(backupId, "Analisando necessidade de manutenção", "[MANUTENCAO] Iniciando análise.");
            TipoManutencao escolhaManual = dto.executarManutencao()
                    ? (dto.manutencaoCompleta() ? TipoManutencao.VACUUM_FULL_ANALYZE : TipoManutencao.VACUUM)
                    : null;
            Manutencao manutencao = manutencaoService.executar(escolhaManual);
            vincularManutencao(backupId, manutencao);
            logar(backupId, "[MANUTENCAO] " + manutencao.getTipo() + " (" + manutencao.getRegraAplicada() + ") -> " + manutencao.getStatus());

            atualizarEtapa(backupId, "Gerando backup do banco (pg_dump)", "[BACKUP] Executando pg_dump.");
            String timestamp = LocalDateTime.now().format(TIMESTAMP);
            Path pastaDestino = Path.of(diretorio);
            Files.createDirectories(pastaDestino);
            Path dump = pastaDestino.resolve("dump_" + timestamp + ".sql");
            executarPgDump(dump);
            logar(backupId, "[BACKUP] Dump gerado em " + dump.getFileName());

            Path arquivoFinal = dump;
            if (dto.compactar() || dto.criptografar()) {
                atualizarEtapa(backupId, "Compactando e criptografando (AES-256)", "[COMPACTACAO] Gerando ZIP protegido por senha.");
                arquivoFinal = compactarComSenha(dump, pastaDestino.resolve("backup_" + timestamp + ".zip"), dto.senha());
                Files.deleteIfExists(dump);
                logar(backupId, "[COMPACTACAO] Arquivo final: " + arquivoFinal.getFileName());
            }

            if (dto.caminhoCopiaAdicional() != null && !dto.caminhoCopiaAdicional().isBlank()) {
                atualizarEtapa(backupId, "Copiando para destino adicional", "[COPIA] Copiando para " + dto.caminhoCopiaAdicional());
                Path destinoAdicional = Path.of(dto.caminhoCopiaAdicional());
                Files.createDirectories(destinoAdicional);
                Files.copy(arquivoFinal, destinoAdicional.resolve(arquivoFinal.getFileName()), StandardCopyOption.REPLACE_EXISTING);
                logar(backupId, "[COPIA] Cópia concluída.");
            }

            atualizarEtapa(backupId, "Aplicando política de retenção", "[RETENCAO] Verificando quantidade a manter.");
            int removidos = aplicarRetencao(dto.quantidadeAManter());
            logar(backupId, "[RETENCAO] " + removidos + " backup(s) antigo(s) removido(s).");

            finalizarComSucesso(backupId, arquivoFinal);
        } catch (Exception e) {
            finalizarComFalha(backupId, e);
        }
    }

    private void executarPgDump(Path destino) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                "pg_dump", "-h", dbHost, "-p", dbPort, "-U", dbUser,
                "-F", "p", "-f", destino.toAbsolutePath().toString(), dbName
        );
        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        Process processo = pb.start();
        String saida = new String(processo.getInputStream().readAllBytes());
        int codigo = processo.waitFor();

        if (codigo != 0) {
            throw new IOException("pg_dump finalizou com código " + codigo + ": " + saida);
        }
    }

    private Path compactarComSenha(Path arquivoOrigem, Path arquivoZip, String senha) throws IOException {
        ZipParameters parametros = new ZipParameters();
        parametros.setEncryptFiles(true);
        parametros.setEncryptionMethod(EncryptionMethod.AES);
        parametros.setAesKeyStrength(AesKeyStrength.KEY_STRENGTH_256);

        try (ZipFile zipFile = new ZipFile(arquivoZip.toFile(), senha.toCharArray())) {
            zipFile.addFile(arquivoOrigem.toFile(), parametros);
        }
        return arquivoZip;
    }

    private int aplicarRetencao(Integer quantidadeAManter) throws IOException {
        if (quantidadeAManter == null || quantidadeAManter <= 0) {
            return 0;
        }

        List<Backup> historico = backupRepository.findAllByStatusOrderByIniciadoEmDesc("SUCESSO").stream()
                .sorted(Comparator.comparing(Backup::getIniciadoEm).reversed())
                .toList();

        if (historico.size() <= quantidadeAManter) {
            return 0;
        }

        List<Backup> excedentes = historico.subList(quantidadeAManter, historico.size());
        for (Backup antigo : excedentes) {
            if (antigo.getCaminho() != null) {
                Files.deleteIfExists(Path.of(antigo.getCaminho()));
            }
            backupRepository.delete(antigo);
        }
        return excedentes.size();
    }

    private void atualizarEtapa(Long backupId, String etapa, String linhaLog) {
        Backup backup = backupRepository.findById(backupId).orElseThrow();
        backup.setEtapaAtual(etapa);
        backup.setLog(backup.getLog() + "\n[" + LocalDateTime.now() + "] " + linhaLog);
        backupRepository.save(backup);
    }

    private void logar(Long backupId, String linha) {
        Backup backup = backupRepository.findById(backupId).orElseThrow();
        backup.setLog(backup.getLog() + "\n[" + LocalDateTime.now() + "] " + linha);
        backupRepository.save(backup);
    }

    private void vincularManutencao(Long backupId, Manutencao manutencao) {
        Backup backup = backupRepository.findById(backupId).orElseThrow();
        backup.setManutencao(manutencao);
        backupRepository.save(backup);
    }

    private void finalizarComSucesso(Long backupId, Path arquivoFinal) throws IOException {
        Backup backup = backupRepository.findById(backupId).orElseThrow();
        backup.setArquivo(arquivoFinal.getFileName().toString());
        backup.setCaminho(arquivoFinal.toAbsolutePath().toString());
        backup.setTamanhoBytes(Files.size(arquivoFinal));
        backup.setCriptografado(true);
        backup.setCompactado(true);
        backup.setStatus("SUCESSO");
        backup.setEtapaAtual("Concluído");
        backup.setMensagem("Backup gerado com sucesso.");
        backup.setFinalizadoEm(LocalDateTime.now());
        backup.setLog(backup.getLog() + "\n[" + LocalDateTime.now() + "] [FINALIZACAO] Processo concluído com sucesso.");
        backupRepository.save(backup);
    }

    private void finalizarComFalha(Long backupId, Exception e) {
        Backup backup = backupRepository.findById(backupId).orElseThrow();
        String mensagemErro = mensagemSegura(e);
        backup.setStatus("FALHA");
        backup.setEtapaAtual("Falhou em: " + backup.getEtapaAtual());
        backup.setMensagem(mensagemErro);
        backup.setFinalizadoEm(LocalDateTime.now());
        backup.setLog(backup.getLog() + "\n[" + LocalDateTime.now() + "] [ERRO] " + mensagemErro);
        backupRepository.save(backup);

        boolean enviado = emailService.simularEnvioLogFalha(
                backupId,
                "Falha na geração do backup #" + backupId,
                backup.getLog()
        );
        backup.setLogEnviadoEmail(enviado);
        backupRepository.save(backup);
    }

    private String mensagemSegura(Exception e) {
        String msg = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
        return msg.replace(dbPassword, "***");
    }
}
