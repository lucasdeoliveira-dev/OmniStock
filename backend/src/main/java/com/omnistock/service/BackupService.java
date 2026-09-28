package com.omnistock.service;

import com.omnistock.dto.backup.BackupRequestDTO;
import com.omnistock.dto.backup.BackupResponseDTO;
import com.omnistock.dto.backup.TesteConexaoResponseDTO;
import com.omnistock.exception.BusinessException;
import com.omnistock.exception.ResourceNotFoundException;
import com.omnistock.model.Backup;
import com.omnistock.repository.BackupRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BackupService {

    private final BackupRepository backupRepository;
    private final BackupExecutionWorker backupExecutionWorker;
    private final DataSource dataSource;

    @Value("${DB_NAME:omnistock}")
    private String dbName;

    @Value("${DB_PASSWORD:omnistock}")
    private String dbPassword;

    public BackupService(BackupRepository backupRepository, BackupExecutionWorker backupExecutionWorker,
                          DataSource dataSource) {
        this.backupRepository = backupRepository;
        this.backupExecutionWorker = backupExecutionWorker;
        this.dataSource = dataSource;
    }

    @Transactional(readOnly = true)
    public List<BackupResponseDTO> listarHistorico() {
        return backupRepository.findAllByOrderByIniciadoEmDesc().stream()
                .map(BackupResponseDTO::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public BackupResponseDTO buscarPorId(Long id) {
        return backupRepository.findById(id)
                .map(BackupResponseDTO::de)
                .orElseThrow(() -> new ResourceNotFoundException("Backup não encontrado: " + id));
    }

    public String buscarLog(Long id) {
        Backup backup = backupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Backup não encontrado: " + id));
        return backup.getLog() == null ? "" : backup.getLog();
    }

    public TesteConexaoResponseDTO testarConexao() {
        try (Connection conexao = dataSource.getConnection()) {
            boolean valida = conexao.isValid(3);
            return new TesteConexaoResponseDTO(valida, valida
                    ? "Conexão com o banco '" + dbName + "' estabelecida com sucesso."
                    : "Não foi possível validar a conexão.");
        } catch (Exception e) {
            return new TesteConexaoResponseDTO(false, "Falha ao conectar: " + mensagemSegura(e));
        }
    }

    /**
     * Valida os parâmetros e dispara a execução em background (BackupExecutionWorker),
     * retornando imediatamente com o registro em EM_ANDAMENTO para o frontend fazer polling.
     */
    public BackupResponseDTO iniciar(BackupRequestDTO dto) {
        if (!dto.nomeBanco().equals(dbName)) {
            throw new BusinessException("Banco de dados inválido. Esperado: " + dbName);
        }
        validarCaminho(dto.caminhoCopiaAdicional());
        validarCaminho(dto.caminhoDestino());

        Backup backup = new Backup();
        backup.setStatus("EM_ANDAMENTO");
        backup.setEtapaAtual("Validando conexão e parâmetros");
        backup.setIniciadoEm(LocalDateTime.now());
        backup.setLog("[" + LocalDateTime.now() + "] [VALIDACAO] Parâmetros aceitos. Banco=" + dto.nomeBanco());

        Backup salvo = backupRepository.save(backup);
        backupExecutionWorker.executar(salvo.getId(), dto);
        return BackupResponseDTO.de(salvo);
    }

    private void validarCaminho(String caminho) {
        if (caminho != null && caminho.contains("..")) {
            throw new BusinessException("Caminho informado é inválido.");
        }
    }

    private String mensagemSegura(Exception e) {
        String msg = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
        return msg.replace(dbPassword, "***");
    }
}
