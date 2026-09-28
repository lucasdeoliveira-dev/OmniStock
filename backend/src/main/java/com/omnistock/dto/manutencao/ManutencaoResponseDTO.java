package com.omnistock.dto.manutencao;

import com.omnistock.enums.OrigemDecisao;
import com.omnistock.enums.TipoManutencao;
import com.omnistock.model.Manutencao;

import java.time.LocalDateTime;

public record ManutencaoResponseDTO(
        Long id,
        TipoManutencao tipo,
        OrigemDecisao origem,
        String regraAplicada,
        String status,
        String mensagem,
        LocalDateTime iniciadoEm,
        LocalDateTime finalizadoEm
) {
    public static ManutencaoResponseDTO de(Manutencao m) {
        return new ManutencaoResponseDTO(
                m.getId(), m.getTipo(), m.getOrigem(), m.getRegraAplicada(),
                m.getStatus(), m.getMensagem(), m.getIniciadoEm(), m.getFinalizadoEm()
        );
    }
}
