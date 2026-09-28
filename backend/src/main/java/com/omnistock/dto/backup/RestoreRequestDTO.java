package com.omnistock.dto.backup;

import jakarta.validation.constraints.NotBlank;

public record RestoreRequestDTO(
        @NotBlank String senha
) {
}
