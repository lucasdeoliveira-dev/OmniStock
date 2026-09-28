package com.omnistock.dto.pedido;

import com.omnistock.enums.StatusPedido;
import com.omnistock.model.PedidoVenda;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoVendaResponseDTO(
        Long id,
        Long clienteId,
        String clienteNome,
        StatusPedido status,
        LocalDateTime data,
        List<ItemDTO> itens,
        BigDecimal total
) {
    public record ItemDTO(Long produtoId, String produtoNome, int quantidade, BigDecimal precoVenda) {
    }

    public static PedidoVendaResponseDTO de(PedidoVenda p) {
        List<ItemDTO> itens = p.getItens().stream()
                .map(i -> new ItemDTO(i.getProduto().getId(), i.getProduto().getNome(), i.getQuantidade(), i.getPrecoVenda()))
                .toList();

        BigDecimal total = itens.stream()
                .map(i -> i.precoVenda().multiply(BigDecimal.valueOf(i.quantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PedidoVendaResponseDTO(
                p.getId(), p.getCliente().getId(), p.getCliente().getNome(),
                p.getStatus(), p.getData(), itens, total
        );
    }
}
