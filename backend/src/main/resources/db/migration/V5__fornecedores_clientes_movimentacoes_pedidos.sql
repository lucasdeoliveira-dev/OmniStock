CREATE TABLE fornecedores (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    contato VARCHAR(150),
    email VARCHAR(150)
);

CREATE TABLE clientes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(30)
);

CREATE TABLE movimentacoes (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL REFERENCES produtos(id),
    tipo VARCHAR(10) NOT NULL,
    quantidade INT NOT NULL,
    motivo VARCHAR(255),
    data TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE pedidos_compra (
    id BIGSERIAL PRIMARY KEY,
    fornecedor_id BIGINT NOT NULL REFERENCES fornecedores(id),
    status VARCHAR(20) NOT NULL,
    data TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE itens_pedido_compra (
    id BIGSERIAL PRIMARY KEY,
    pedido_compra_id BIGINT NOT NULL REFERENCES pedidos_compra(id),
    produto_id BIGINT NOT NULL REFERENCES produtos(id),
    quantidade INT NOT NULL,
    preco_custo NUMERIC(12,2) NOT NULL
);

CREATE TABLE pedidos_venda (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    status VARCHAR(20) NOT NULL,
    data TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE itens_pedido_venda (
    id BIGSERIAL PRIMARY KEY,
    pedido_venda_id BIGINT NOT NULL REFERENCES pedidos_venda(id),
    produto_id BIGINT NOT NULL REFERENCES produtos(id),
    quantidade INT NOT NULL,
    preco_venda NUMERIC(12,2) NOT NULL
);
