package com.omnistock.dto.backup;

public record RestoreResponseDTO(
        boolean sucesso,
        String mensagem,
        long contagemOriginal,
        long contagemRestaurada,
        boolean integro
) {
}
