package com.omnistock.dto.pedido;

import com.omnistock.enums.StatusPedido;
import com.omnistock.model.PedidoCompra;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoCompraResponseDTO(
        Long id,
        Long fornecedorId,
        String fornecedorNome,
        StatusPedido status,
        LocalDateTime data,
        List<ItemDTO> itens,
        BigDecimal total
) {
    public record ItemDTO(Long produtoId, String produtoNome, int quantidade, BigDecimal precoCusto) {
    }

    public static PedidoCompraResponseDTO de(PedidoCompra p) {
        List<ItemDTO> itens = p.getItens().stream()
                .map(i -> new ItemDTO(i.getProduto().getId(), i.getProduto().getNome(), i.getQuantidade(), i.getPrecoCusto()))
                .toList();

        BigDecimal total = itens.stream()
                .map(i -> i.precoCusto().multiply(BigDecimal.valueOf(i.quantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PedidoCompraResponseDTO(
                p.getId(), p.getFornecedor().getId(), p.getFornecedor().getNome(),
                p.getStatus(), p.getData(), itens, total
        );
    }
}
