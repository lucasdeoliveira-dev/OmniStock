package com.omnistock.dto.fornecedor;

import com.omnistock.model.Fornecedor;

public record FornecedorResponseDTO(
        Long id,
        String nome,
        String cnpj,
        String contato,
        String email
) {
    public static FornecedorResponseDTO de(Fornecedor f) {
        return new FornecedorResponseDTO(f.getId(), f.getNome(), f.getCnpj(), f.getContato(), f.getEmail());
    }
}
