# Engenharia de sistemas

## Visão ponta a ponta

Minha atuação cobre produto, backend, interfaces, dados, integrações, infraestrutura e operação. A escolha das tecnologias varia; os critérios permanecem: limites claros, comportamento testável, dados confiáveis e operação previsível.

## Linguagens e ecossistemas

| Área | Tecnologias utilizadas |
|---|---|
| Backend e automação | Python, Flask, SQLAlchemy, Alembic, Pydantic, Gunicorn |
| Web | TypeScript, JavaScript, React, Vite, Tailwind CSS, Jinja2, HTML e CSS |
| Mobile | Dart e Flutter para Android, iOS, Web e desktop |
| Sistemas e dados | Java 21, JDBC, SQL, T-SQL, PostgreSQL, MySQL, SQLite e SQL Server |
| Infraestrutura | HCL/Terraform, Shell, PowerShell, Docker e Docker Compose |
| IA e automação inteligente | APIs de modelos, agentes, orquestração de ferramentas, classificação de intenção, Whisper e processamento de documentos |

## Padrões que aplico

### Domínio separado da entrega

Rotas e telas cuidam de entrada e apresentação. Serviços concentram decisões; modelos representam o estado; integrações ficam atrás de adaptadores. Esse desenho reduz o custo de mudar interface, fornecedor ou transporte sem reescrever a regra central.

### Processamento assíncrono quando faz sentido

Uso filas e workers quando uma tarefa não precisa ocupar o request do usuário. O desenho considera idempotência, mensagens inválidas, retry, DLQ, ordem de eventos, encerramento gracioso e modo degradado.

### Banco como contrato evolutivo

Trabalho com migrations versionadas, upgrade e downgrade em CI, testes sobre banco real e estratégias compatíveis com rollout. Alterações destrutivas são divididas em etapas para preservar rollback e dados.

### Observabilidade acionável

Logs estruturados carregam contexto técnico e eventos de domínio sem registrar dados sensíveis. Health checks, métricas, alarmes e runbooks são desenhados para responder “o usuário está sendo atendido?” e “o time sabe o que fazer agora?”.

### Entrega segura

Pipelines incluem lint, testes unitários e de integração, cobertura, migrations em banco limpo, auditoria de dependências, detecção de segredos, build de containers e smoke tests. Deploys usam permissões mínimas, concorrência controlada e artefatos imutáveis.

## Experiência por tipo de sistema

- aplicações web modulares com autenticação, perfis e regras de domínio;
- APIs e integrações com sistemas corporativos e serviços externos;
- aplicativos Flutter com consumo de API, câmera, persistência local e múltiplos targets;
- agentes de IA com ferramentas, documentos, áudio, calendário e canais de mensagem;
- pipelines de analytics e consolidação assíncrona;
- dashboards executivos e visualização de dados;
- aplicações Java com camadas DAO, serviço, validação e integração JDBC;
- infraestrutura AWS gerenciada com Terraform e guardrails de custo e segurança.

## Como avalio uma decisão técnica

Uma decisão é boa quando o time consegue explicar:

1. qual problema ela resolve;
2. quais restrições respeita;
3. que falhas introduz;
4. como será observada;
5. quanto custa operar;
6. como será revertida ou substituída.

Essa disciplina evita arquiteturas impressionantes no diagrama e frágeis na operação.

---

[← Voltar ao portfólio](../README.md) · [Estudo de caso](case-study-business-first.md) · [Cloud & Terraform](cloud-terraform.md)
