-- Usuário gerente de teste (senha: senha123, mesmo hash BCrypt já usado para os demais usuários de teste)
INSERT INTO usuarios (nome, email, senha, role, ativo)
VALUES ('Gerente de Estoque', 'gerente@omnistock.com', '$2b$10$FvvNvzlJikKWY27IFhSqt.E/SBFQmuD3d/Z92hfdkvovRoaPaTwyK', 'GERENTE', TRUE);
