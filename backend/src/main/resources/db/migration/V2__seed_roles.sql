-- Usuário administrador padrão (senha: admin123, hash BCrypt)
INSERT INTO usuarios (nome, email, senha, role, ativo)
VALUES ('Administrador', 'admin@omnistock.com', '$2b$10$T6mK3Cafa9cttRwj6R7eKeH/wvLOG3Hc8LkgjoPty.0N1ryBhmHCi', 'ADMIN', TRUE);
