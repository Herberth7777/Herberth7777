# Do problema de negócio à arquitetura

> Estudo de caso anonimizado. O contexto é real; nomes, clientes, regras proprietárias, números e detalhes operacionais foram removidos.

## O problema antes do software

Uma operação distribuída de varejo precisava transformar atividades de campo, evidências, dados comerciais e informações de sistemas legados em decisões mais rápidas e confiáveis. O desafio não era simplesmente “criar uma plataforma”. Era criar uma linguagem comum entre quem executava a operação, quem acompanhava indicadores e quem tomava decisões.

Antes de escolher framework, banco ou serviço de nuvem, trabalhei sobre perguntas de negócio:

- Quais decisões precisam ser tomadas e com que frequência?
- Quem produz cada informação e quem responde por sua qualidade?
- O que precisa ser registrado no momento da execução?
- Quais regras devem ser determinísticas e auditáveis?
- Onde uma recomendação inteligente realmente reduz esforço ou melhora a decisão?
- Qual informação vem de sistemas existentes e qual nasce no novo fluxo?

Essa etapa define se o sistema vai resolver a operação ou apenas digitalizar sua desorganização.

## Transformando operação em domínio

O trabalho foi organizado em quatro frentes:

1. **Atores e responsabilidades** — separar execução em campo, gestão, administração e integrações.
2. **Eventos do negócio** — identificar o que acontece, em qual ordem e que evidência torna o evento confiável.
3. **Dados mestres e transacionais** — distinguir cadastros de referência das informações produzidas diariamente.
4. **Indicadores e feedback** — conectar a captura operacional à leitura gerencial sem criar métricas que ninguém consegue explicar.

Com o domínio claro, tornou-se possível desenhar limites de módulos, contratos de API, modelo de dados e jornadas mobile sem misturar regra de negócio com detalhes de interface.

## Arquitetura resultante

A solução foi estruturada com responsabilidades explícitas:

- aplicativo Flutter para jornadas móveis e captura no ponto de execução;
- backend Python com APIs e serviços de domínio;
- interface web para administração, acompanhamento e análise;
- persistência relacional para rastreabilidade e consistência;
- adaptadores para integração com sistemas corporativos e fluxos legados;
- testes automatizados sobre os fluxos críticos do negócio;
- infraestrutura preparada para evolução em cloud.

O desenho não nasceu de uma preferência por tecnologia. Cada camada responde a uma necessidade: mobilidade, governança, integração, auditabilidade ou velocidade de decisão.

## Decisões que demonstram maturidade de produto

| Decisão | Razão de negócio |
|---|---|
| Separar regras de domínio das rotas e telas | Permitir evolução do processo sem reescrever toda a aplicação |
| Tratar integrações como adaptadores | Reduzir o acoplamento com sistemas que mudam em ritmos diferentes |
| Manter decisões críticas explicáveis | Facilitar auditoria, suporte e confiança de quem opera |
| Usar IA onde existe ganho verificável | Evitar complexidade sem retorno e preservar previsibilidade |
| Projetar web e mobile sobre contratos claros | Atender públicos diferentes sem duplicar regra de negócio |
| Testar fluxos completos, não apenas funções isoladas | Proteger o comportamento que entrega valor ao usuário |

## Onde a inteligência artificial entra

Minha abordagem não é adicionar IA como rótulo. Primeiro defino a decisão, os dados disponíveis, o custo do erro e como a recomendação será avaliada. Regras determinísticas continuam determinísticas quando isso favorece explicabilidade; IA entra para classificação, assistência, priorização ou geração quando há ganho concreto.

Esse critério também reduz custo operacional: nem todo problema precisa de um modelo, e nem todo modelo precisa estar no caminho crítico da aplicação.

## Resultado profissional

Este trabalho representa minha atuação ponta a ponta:

- descoberta e modelagem do problema;
- tradução de processos em domínio e dados;
- arquitetura web, mobile e integrações;
- implementação de backend e contratos;
- qualidade automatizada e evolução segura;
- decisões de cloud, segurança e custo conectadas ao negócio.

O diferencial que procuro levar para cada projeto é esse: **entender o sistema econômico e operacional por trás da tela, para então construir a tecnologia certa**.

---

[← Voltar ao portfólio](../README.md) · [Cloud & Terraform](cloud-terraform.md) · [Engenharia de sistemas](systems-engineering.md)
