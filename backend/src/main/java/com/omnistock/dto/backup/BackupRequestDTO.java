package com.omnistock.dto.backup;

import jakarta.validation.constraints.NotBlank;

public record BackupRequestDTO(
        @NotBlank String nomeBanco,
        String caminhoDestino,
        boolean criptografar,
        boolean compactar,
        @NotBlank String senha,
        Integer quantidadeAManter,
        String caminhoCopiaAdicional,
        boolean executarManutencao,
        boolean manutencaoCompleta
) {
}
