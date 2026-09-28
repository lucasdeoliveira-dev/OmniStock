package com.omnistock.dto.categoria;

import com.omnistock.model.Categoria;

public record CategoriaResponseDTO(
        Long id,
        String nome,
        String descricao
) {
    public static CategoriaResponseDTO de(Categoria categoria) {
        return new CategoriaResponseDTO(categoria.getId(), categoria.getNome(), categoria.getDescricao());
    }
}
