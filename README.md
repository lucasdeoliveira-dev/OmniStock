# OmniStock

Plataforma de gerenciamento de estoque (produtos, categorias, fornecedores, clientes,
movimentações, pedidos de compra/venda e relatórios) com um módulo de **gerenciamento de
backup e manutenção** do próprio banco de dados — decisão automática de manutenção
(VACUUM / VACUUM FULL ANALYZE), backup criptografado (AES-256) e compactado (ZIP com senha),
retenção, cópia para destino adicional, log estruturado por etapa, simulação de envio de
e-mail em falhas, e restauração com verificação de integridade.

Desenvolvido por **Lucas de Oliveira** e **Davi Medeiros de Oliveira**.

## Stack

- **Backend**: Java 21, Spring Boot 3, Spring Data JPA, Spring Security + JWT, Flyway, Zip4j (AES-256)
- **Banco de dados**: PostgreSQL 16
- **Frontend**: React 18 + Vite, Tailwind CSS, Recharts, Axios
- **Containerização**: Docker + Docker Compose

## Como rodar

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução.

```bash
docker compose up --build
```

Isso sobe três serviços:

| Serviço | Porta | Descrição |
|---|---|---|
| `db` | 5432 | PostgreSQL, com dados de exemplo já populados via migrations Flyway |
| `backend` | 8080 | API REST (Spring Boot) |
| `frontend` | 5173 | Interface web (React) |

Acesse `http://localhost:5173`.

### Login de teste

| E-mail | Senha |
|---|---|
| admin@omnistock.com | admin123 |
| lucas.oliveira@omnistock.com | senha123 |
| davi.medeiros@omnistock.com | senha123 |

### Documentação da API (Swagger)

`http://localhost:8080/api/docs/ui`

### Encerrar

```bash
docker compose down          # mantém os dados do banco
docker compose down -v       # remove também o volume do banco (dados voltam ao estado inicial das migrations)
```

## Rodando o backend fora do Docker (para debug no IntelliJ)

1. Suba só o banco: `docker compose up -d db`
2. Abra `backend/pom.xml` no IntelliJ como projeto Maven.
3. Rode `OmniStockApplication` (usa os defaults de `application.yml`, que já apontam para `localhost:5432`).

## Variáveis de ambiente

Veja `frontend/.env.example` e as variáveis já documentadas em `docker-compose.yml`
(`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`,
`BACKUP_DIR`). As credenciais versionadas neste repositório são fictícias, usadas apenas para
o ambiente de desenvolvimento/demonstração — **não representam credenciais de produção**.

## Estrutura do projeto

```
backend/    API Spring Boot (controllers, services, repositories, migrations Flyway em
            src/main/resources/db/migration)
frontend/   Interface React (páginas em src/pages, chamadas à API em src/services)
```

## Módulo de Backup e Manutenção

O fluxo completo (validação → decisão de manutenção → dump → criptografia/compactação →
retenção → cópia adicional → finalização) roda em background a partir da tela **Backup**,
sem bloquear a interface; o progresso é acompanhado via polling e o log de cada execução
fica disponível na própria tela. Em caso de falha, o log é preservado e uma simulação de
envio por e-mail é registrada em `backups/emails/` (dentro do volume do container `backend`).

A restauração é feita em um banco de verificação isolado (não sobrescreve os dados em uso)
e compara a contagem de registros para comprovar a integridade dos dados restaurados.
