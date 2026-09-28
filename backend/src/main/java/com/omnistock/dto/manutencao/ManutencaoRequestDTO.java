package com.omnistock.dto.manutencao;

import com.omnistock.enums.TipoManutencao;

public record ManutencaoRequestDTO(
        boolean executarManutencao,
        boolean manutencaoCompleta
) {
    public TipoManutencao escolhaManual() {
        if (!executarManutencao) {
            return null;
        }
        return manutencaoCompleta ? TipoManutencao.VACUUM_FULL_ANALYZE : TipoManutencao.VACUUM;
    }
}
