CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255)
);

CREATE TABLE produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    categoria_id BIGINT NOT NULL REFERENCES categorias(id),
    quantidade INT NOT NULL DEFAULT 0,
    preco_custo NUMERIC(12,2) NOT NULL,
    preco_venda NUMERIC(12,2) NOT NULL,
    estoque_minimo INT NOT NULL DEFAULT 0
);
