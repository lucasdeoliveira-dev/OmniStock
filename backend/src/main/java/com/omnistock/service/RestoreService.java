package com.omnistock.service;

import com.omnistock.dto.backup.RestoreResponseDTO;
import com.omnistock.exception.BusinessException;
import com.omnistock.exception.ResourceNotFoundException;
import com.omnistock.model.Backup;
import com.omnistock.repository.BackupRepository;
import net.lingala.zip4j.ZipFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

@Service
public class RestoreService {

    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final BackupRepository backupRepository;

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

    public RestoreService(BackupRepository backupRepository) {
        this.backupRepository = backupRepository;
    }

    public RestoreResponseDTO restaurar(Long backupId, String senha) {
        Backup backup = backupRepository.findById(backupId)
                .orElseThrow(() -> new ResourceNotFoundException("Backup não encontrado: " + backupId));

        if (!"SUCESSO".equals(backup.getStatus()) || backup.getCaminho() == null) {
            throw new BusinessException("Só é possível restaurar um backup concluído com sucesso.");
        }

        Path arquivoBackup = Path.of(backup.getCaminho());
        if (!Files.exists(arquivoBackup)) {
            throw new BusinessException("Arquivo de backup não encontrado em disco: " + backup.getCaminho());
        }

        String bancoRestauracao = "omnistock_restore_" + backupId + "_" + LocalDateTime.now().format(TIMESTAMP);
        Path sqlExtraido = null;

        try {
            Path sqlParaRestaurar;
            if (backup.isCompactado()) {
                sqlExtraido = extrairZip(arquivoBackup, senha);
                sqlParaRestaurar = sqlExtraido;
            } else {
                sqlParaRestaurar = arquivoBackup;
            }

            executarPsql("postgres", "-c", "DROP DATABASE IF EXISTS " + bancoRestauracao);
            executarPsql("postgres", "-c", "CREATE DATABASE " + bancoRestauracao);
            executarPsql(bancoRestauracao, "-f", sqlParaRestaurar.toAbsolutePath().toString());

            String bancoOriginal = backup.getNomeBanco() == null ? dbName : backup.getNomeBanco();
            long contagemOriginal = contarProdutos(bancoOriginal);
            long contagemRestaurada = contarProdutos(bancoRestauracao);
            boolean integro = contagemOriginal == contagemRestaurada;

            return new RestoreResponseDTO(
                    true,
                    integro
                            ? "Restauração concluída e íntegra: " + contagemRestaurada + " produtos restaurados."
                            : "Restauração concluída, mas a contagem de produtos diverge do banco original.",
                    contagemOriginal, contagemRestaurada, integro
            );
        } catch (Exception e) {
            String msg = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
            throw new BusinessException("Falha ao restaurar backup: " + msg.replace(dbPassword, "***"));
        } finally {
            try {
                if (sqlExtraido != null) {
                    Files.deleteIfExists(sqlExtraido);
                }
                executarPsql("postgres", "-c", "DROP DATABASE IF EXISTS " + bancoRestauracao);
            } catch (Exception ignorado) {
            }
        }
    }

    private Path extrairZip(Path arquivoZip, String senha) throws IOException {
        Path pastaTemp = arquivoZip.getParent().resolve("restore_tmp_" + System.currentTimeMillis());
        Files.createDirectories(pastaTemp);

        try (ZipFile zipFile = new ZipFile(arquivoZip.toFile(), senha.toCharArray())) {
            zipFile.extractAll(pastaTemp.toAbsolutePath().toString());
        } catch (net.lingala.zip4j.exception.ZipException e) {
            throw new BusinessException("Senha incorreta ou arquivo de backup corrompido.");
        }

        try (var arquivos = Files.list(pastaTemp)) {
            return arquivos.findFirst()
                    .orElseThrow(() -> new BusinessException("Nenhum arquivo .sql encontrado dentro do backup."));
        }
    }

    private long contarProdutos(String banco) throws IOException, InterruptedException {
        String saida = executarPsql(banco, "-t", "-A", "-c", "SELECT COUNT(*) FROM produtos");
        return Long.parseLong(saida.trim());
    }

    private String executarPsql(String banco, String... args) throws IOException, InterruptedException {
        var comando = new java.util.ArrayList<String>();
        comando.add("psql");
        comando.add("-h");
        comando.add(dbHost);
        comando.add("-p");
        comando.add(dbPort);
        comando.add("-U");
        comando.add(dbUser);
        comando.add("-d");
        comando.add(banco);
        comando.addAll(java.util.Arrays.asList(args));

        ProcessBuilder pb = new ProcessBuilder(comando);
        pb.environment().put("PGPASSWORD", dbPassword);
        pb.redirectErrorStream(true);

        Process processo = pb.start();
        String saida = new String(processo.getInputStream().readAllBytes());
        int codigo = processo.waitFor();

        if (codigo != 0) {
            throw new IOException("Comando psql falhou (" + codigo + "): " + saida);
        }
        return saida;
    }
}
