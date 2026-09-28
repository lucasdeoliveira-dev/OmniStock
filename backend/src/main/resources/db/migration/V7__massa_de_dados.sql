-- Usuários da equipe (senha: senha123, hash BCrypt)
INSERT INTO usuarios (nome, email, senha, role, ativo)
VALUES
    ('Lucas de Oliveira', 'lucas.oliveira@omnistock.com', '$2b$10$MLSOBkrELthaizBboJcLMuR9DNXZXM7fEoBjWU3Fm7LX6eflz5kyq', 'ADMIN', TRUE),
    ('Davi Medeiros de Oliveira', 'davi.medeiros@omnistock.com', '$2b$10$FvvNvzlJikKWY27IFhSqt.E/SBFQmuD3d/Z92hfdkvovRoaPaTwyK', 'ADMIN', TRUE);

-- Categorias
INSERT INTO categorias (nome, descricao) VALUES
    ('Eletrônicos', 'Smartphones, wearables e gadgets'),
    ('Informática', 'Notebooks, PCs e componentes'),
    ('Periféricos', 'Monitores, teclados, mouses e headsets'),
    ('Servidores e Redes', 'Roteadores corporativos, switches e racks'),
    ('Acessórios e Cabos', 'Cabos, adaptadores e suportes');

-- Fornecedores
INSERT INTO fornecedores (nome, cnpj, contato, email) VALUES
    ('TechDistribuidora Brasil Ltda', '12345678000101', 'Roberto Mendes', 'contato@techdistribuidora.com'),
    ('Global Componentes e Redes', '98765432000102', 'Fernanda Souza', 'vendas@globalcomponentes.com'),
    ('Perifericos Express Import', '45123890000103', 'Julio Santos', 'comercial@perifericosexpress.com');

-- Clientes
INSERT INTO clientes (nome, documento, email, telefone) VALUES
    ('TechCorp Sistemas', '11222333000155', 'compras@techcorp.com', '11988887777'),
    ('Inovacao Digital ME', '22333444000166', 'financeiro@inovacaodigital.com', '11977776666'),
    ('Consumidor Final', '39804276002', 'cliente@exemplo.com', '11966665555');

-- Produtos
INSERT INTO produtos (nome, sku, categoria_id, quantidade, preco_custo, preco_venda, estoque_minimo) VALUES
    ('Processador Intel Core i7 13a Gen', 'SKU-PROC-I713', (SELECT id FROM categorias WHERE nome = 'Informática'), 18, 1450.00, 2199.00, 5),
    ('Monitor Gamer 27" 144Hz IPS', 'SKU-MON-27LG', (SELECT id FROM categorias WHERE nome = 'Periféricos'), 8, 890.00, 1599.90, 10),
    ('SSD NVMe M.2 2TB HighSpeed', 'SKU-SSD-2TB-B', (SELECT id FROM categorias WHERE nome = 'Informática'), 64, 380.00, 699.00, 15),
    ('Roteador Gigabit Dual-Band Enterprise', 'SKU-RTR-CISCO', (SELECT id FROM categorias WHERE nome = 'Servidores e Redes'), 4, 2800.00, 4200.00, 5),
    ('Cabo HDMI 2.1 Ultra HD 3m', 'SKU-CBL-HDMI', (SELECT id FROM categorias WHERE nome = 'Acessórios e Cabos'), 120, 18.00, 59.90, 30),
    ('Smartwatch Sport GPS Water Resistant', 'SKU-SMT-WAT4', (SELECT id FROM categorias WHERE nome = 'Eletrônicos'), 3, 410.00, 899.00, 8),
    ('Teclado Mecanico RGB', 'SKU-TEC-RGB', (SELECT id FROM categorias WHERE nome = 'Periféricos'), 40, 150.00, 299.90, 10),
    ('Switch 24 Portas Gerenciavel', 'SKU-SWT-24P', (SELECT id FROM categorias WHERE nome = 'Servidores e Redes'), 6, 950.00, 1490.00, 3);

-- Pedido de compra já recebido (gera histórico de entrada)
INSERT INTO pedidos_compra (fornecedor_id, status, data)
VALUES ((SELECT id FROM fornecedores WHERE cnpj = '98765432000102'), 'RECEBIDO', now() - interval '10 days');

INSERT INTO itens_pedido_compra (pedido_compra_id, produto_id, quantidade, preco_custo)
VALUES
    ((SELECT id FROM pedidos_compra ORDER BY id DESC LIMIT 1), (SELECT id FROM produtos WHERE sku = 'SKU-RTR-CISCO'), 5, 2800.00),
    ((SELECT id FROM pedidos_compra ORDER BY id DESC LIMIT 1), (SELECT id FROM produtos WHERE sku = 'SKU-SWT-24P'), 10, 950.00);

INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo, data)
VALUES
    ((SELECT id FROM produtos WHERE sku = 'SKU-RTR-CISCO'), 'ENTRADA', 5, 'Recebimento do pedido de compra (massa de dados)', now() - interval '10 days'),
    ((SELECT id FROM produtos WHERE sku = 'SKU-SWT-24P'), 'ENTRADA', 10, 'Recebimento do pedido de compra (massa de dados)', now() - interval '10 days');

-- Pedido de venda já confirmado (gera histórico de saída e lucro)
INSERT INTO pedidos_venda (cliente_id, status, data)
VALUES ((SELECT id FROM clientes WHERE documento = '11222333000155'), 'CONFIRMADO', now() - interval '3 days');

INSERT INTO itens_pedido_venda (pedido_venda_id, produto_id, quantidade, preco_venda)
VALUES
    ((SELECT id FROM pedidos_venda ORDER BY id DESC LIMIT 1), (SELECT id FROM produtos WHERE sku = 'SKU-PROC-I713'), 2, 2199.00),
    ((SELECT id FROM pedidos_venda ORDER BY id DESC LIMIT 1), (SELECT id FROM produtos WHERE sku = 'SKU-SSD-2TB-B'), 1, 699.00);

INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo, data)
VALUES
    ((SELECT id FROM produtos WHERE sku = 'SKU-PROC-I713'), 'SAIDA', 2, 'Confirmacao do pedido de venda (massa de dados)', now() - interval '3 days'),
    ((SELECT id FROM produtos WHERE sku = 'SKU-SSD-2TB-B'), 'SAIDA', 1, 'Confirmacao do pedido de venda (massa de dados)', now() - interval '3 days');
