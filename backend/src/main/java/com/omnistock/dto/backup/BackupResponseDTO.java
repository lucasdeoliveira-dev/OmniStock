package com.omnistock.dto.backup;

import com.omnistock.model.Backup;

import java.time.LocalDateTime;

public record BackupResponseDTO(
        Long id,
        String arquivo,
        Long tamanhoBytes,
        boolean criptografado,
        boolean compactado,
        String status,
        String etapaAtual,
        String mensagem,
        Long manutencaoId,
        boolean logEnviadoEmail,
        LocalDateTime iniciadoEm,
        LocalDateTime finalizadoEm
) {
    public static BackupResponseDTO de(Backup b) {
        return new BackupResponseDTO(
                b.getId(), b.getArquivo(), b.getTamanhoBytes(), b.isCriptografado(), b.isCompactado(),
                b.getStatus(), b.getEtapaAtual(), b.getMensagem(),
                b.getManutencao() != null ? b.getManutencao().getId() : null,
                b.isLogEnviadoEmail(), b.getIniciadoEm(), b.getFinalizadoEm()
        );
    }
}
