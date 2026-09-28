package com.omnistock.exception;

import java.time.Instant;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String erro,
        String mensagem
) {
    public ErrorResponse(int status, String erro, String mensagem) {
        this(Instant.now(), status, erro, mensagem);
    }
}
