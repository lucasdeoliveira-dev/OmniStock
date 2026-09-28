package com.omnistock.dto.produto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ProdutoRequestDTO(
        @NotBlank String nome,
        @NotBlank String sku,
        @NotNull Long categoriaId,
        @PositiveOrZero int quantidade,
        @NotNull @PositiveOrZero BigDecimal precoCusto,
        @NotNull @PositiveOrZero BigDecimal precoVenda,
        @PositiveOrZero int estoqueMinimo
) {
}
