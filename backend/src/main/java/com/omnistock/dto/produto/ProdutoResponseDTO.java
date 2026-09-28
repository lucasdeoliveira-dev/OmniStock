package com.omnistock.dto.produto;

import com.omnistock.model.Produto;

import java.math.BigDecimal;

public record ProdutoResponseDTO(
        Long id,
        String nome,
        String sku,
        Long categoriaId,
        String categoriaNome,
        int quantidade,
        BigDecimal precoCusto,
        BigDecimal precoVenda,
        int estoqueMinimo
) {
    public static ProdutoResponseDTO de(Produto produto) {
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getNome(),
                produto.getSku(),
                produto.getCategoria().getId(),
                produto.getCategoria().getNome(),
                produto.getQuantidade(),
                produto.getPrecoCusto(),
                produto.getPrecoVenda(),
                produto.getEstoqueMinimo()
        );
    }
}
