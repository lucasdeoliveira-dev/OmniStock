package com.omnistock.dto.movimentacao;

import com.omnistock.enums.TipoMovimentacao;
import com.omnistock.model.Movimentacao;

import java.time.LocalDateTime;

public record MovimentacaoResponseDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        TipoMovimentacao tipo,
        int quantidade,
        String motivo,
        LocalDateTime data
) {
    public static MovimentacaoResponseDTO de(Movimentacao m) {
        return new MovimentacaoResponseDTO(
                m.getId(),
                m.getProduto().getId(),
                m.getProduto().getNome(),
                m.getTipo(),
                m.getQuantidade(),
                m.getMotivo(),
                m.getData()
        );
    }
}
