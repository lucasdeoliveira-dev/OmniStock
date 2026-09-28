ALTER TABLE backups
    ADD COLUMN etapa_atual VARCHAR(100),
    ADD COLUMN log TEXT,
    ADD COLUMN manutencao_id BIGINT REFERENCES manutencoes(id),
    ADD COLUMN log_enviado_email BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE backups ALTER COLUMN status DROP NOT NULL;
