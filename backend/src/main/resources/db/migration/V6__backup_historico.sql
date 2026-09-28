CREATE TABLE backups (
    id BIGSERIAL PRIMARY KEY,
    arquivo VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tamanho_bytes BIGINT,
    criptografado BOOLEAN NOT NULL DEFAULT FALSE,
    compactado BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL,
    mensagem VARCHAR(1000),
    iniciado_em TIMESTAMP NOT NULL,
    finalizado_em TIMESTAMP
);
