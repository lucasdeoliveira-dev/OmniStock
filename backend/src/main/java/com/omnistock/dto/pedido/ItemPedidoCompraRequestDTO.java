package com.omnistock.dto.pedido;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ItemPedidoCompraRequestDTO(
        @NotNull Long produtoId,
        @Positive int quantidade,
        @NotNull @Positive BigDecimal precoCusto
) {
}
