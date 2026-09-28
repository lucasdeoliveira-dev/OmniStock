package com.omnistock.dto.movimentacao;

import com.omnistock.enums.TipoMovimentacao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MovimentacaoRequestDTO(
        @NotNull Long produtoId,
        @NotNull TipoMovimentacao tipo,
        @Positive int quantidade,
        String motivo
) {
}
