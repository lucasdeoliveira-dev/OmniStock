package com.omnistock.dto.pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PedidoVendaRequestDTO(
        @NotNull Long clienteId,
        @NotEmpty @Valid List<ItemPedidoVendaRequestDTO> itens
) {
}
