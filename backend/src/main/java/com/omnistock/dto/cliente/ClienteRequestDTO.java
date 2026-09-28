package com.omnistock.dto.cliente;

import jakarta.validation.constraints.NotBlank;

public record ClienteRequestDTO(
        @NotBlank String nome,
        @NotBlank String documento,
        String email,
        String telefone
) {
}
