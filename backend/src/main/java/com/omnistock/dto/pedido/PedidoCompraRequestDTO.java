package com.omnistock.dto.pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PedidoCompraRequestDTO(
        @NotNull Long fornecedorId,
        @NotEmpty @Valid List<ItemPedidoCompraRequestDTO> itens
) {
}
