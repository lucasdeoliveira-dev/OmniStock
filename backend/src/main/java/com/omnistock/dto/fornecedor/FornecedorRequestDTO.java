package com.omnistock.dto.fornecedor;

import jakarta.validation.constraints.NotBlank;

public record FornecedorRequestDTO(
        @NotBlank String nome,
        @NotBlank String cnpj,
        String contato,
        String email
) {
}
