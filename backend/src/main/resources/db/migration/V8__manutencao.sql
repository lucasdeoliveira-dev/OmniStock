CREATE TABLE manutencoes (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL,
    origem VARCHAR(20) NOT NULL,
    regra_aplicada VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    mensagem VARCHAR(1000),
    iniciado_em TIMESTAMP NOT NULL,
    finalizado_em TIMESTAMP
);
