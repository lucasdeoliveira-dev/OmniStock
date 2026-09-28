package com.omnistock.dto.cliente;

import com.omnistock.model.Cliente;

public record ClienteResponseDTO(
        Long id,
        String nome,
        String documento,
        String email,
        String telefone
) {
    public static ClienteResponseDTO de(Cliente c) {
        return new ClienteResponseDTO(c.getId(), c.getNome(), c.getDocumento(), c.getEmail(), c.getTelefone());
    }
}
