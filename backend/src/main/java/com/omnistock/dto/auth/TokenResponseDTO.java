package com.omnistock.dto.auth;

public record TokenResponseDTO(
        String token,
        String tipo,
        String nome,
        String email,
        String role
) {
    public TokenResponseDTO(String token, String nome, String email, String role) {
        this(token, "Bearer", nome, email, role);
    }
}
