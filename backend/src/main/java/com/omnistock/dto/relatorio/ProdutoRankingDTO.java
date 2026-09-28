package com.omnistock.dto.relatorio;

public record ProdutoRankingDTO(
        Long produtoId,
        String produtoNome,
        long quantidadeVendida
) {
}
