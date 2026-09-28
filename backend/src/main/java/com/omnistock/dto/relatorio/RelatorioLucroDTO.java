package com.omnistock.dto.relatorio;

import java.math.BigDecimal;

public record RelatorioLucroDTO(
        BigDecimal totalVendas,
        BigDecimal totalCustoVendido,
        BigDecimal lucro,
        long totalPedidosVenda
) {
}
