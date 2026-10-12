# CLAUDE.md — site urbiverso.com.br

Este repositório é **público**. O histórico também: o que for commitado fica visível para sempre, mesmo se apagado depois.

## Regras

- **Nada de infraestrutura no site nem no repositório:** nenhum codinome de host, IP, nome de cliente, trecho de documentação interna da plataforma ou credencial. Só entra aqui o que pode ir ao ar.
  Moram aqui duas credenciais, públicas por natureza porque o navegador precisa delas. A **URL de entrada do formulário** (`assets/conhecer.js`, usada por `conhecer/` e `en/get-in-touch/`): para trocá-la, revoga-se o ingresso no hub e publica-se a nova aqui. O **link da página de vagas** (o `?p=` do iframe de `trabalhe-conosco/` e de `en/careers/`): gerar um novo link no hub derruba o iframe na hora, e aí é preciso copiar de novo o código de incorporação e colá-lo nas duas páginas.
- **Commits com e-mail noreply do GitHub** (`git config user.email` local deste clone).
- **Site estático, sem build:** HTML, CSS e JS puros. Mobile-first; toda animação respeita `prefers-reduced-motion`.
- **Duas línguas:** português na raiz, inglês em `en/` (`get-in-touch/` = `conhecer/`, `careers/` = `trabalhe-conosco/`). Cada página existe nas duas, com `hreflang` e link PT/EN no topo. CSS e JS da home e do formulário ficam em `assets/` e servem às duas versões; os textos que o JS escreve na tela ficam no dicionário `TEXTOS`, escolhido pelo `lang` da página. Mudou texto numa língua, muda na outra. O formulário em inglês manda para a mesma campanha, com as perguntas em inglês; o e-mail de confirmação e a lista de vagas continuam em português.
- **Formulário:** é do próprio site e faz `POST` direto na URL de entrada de uma campanha do app de leads no hub. A origem do site precisa estar liberada no CORS dos webhooks do hub. Outras partes interativas entram como `<iframe>` de páginas públicas do hub com embed liberado para este domínio, como a lista de vagas de `trabalhe-conosco/`. Essa lista vem do app de recrutamento e é colada exatamente como o app gera: o iframe e o script de altura.
- **Identidade visual** parte do material de marca da plataforma (logo galáxia/engrenagem).

## Texto: sem AI slop

O conteúdo nasce das frases do Ricardo. Quem edita ajusta ritmo, não inventa tese. Proibido:
- abertura genérica ("num mundo cada vez mais…", "no cenário atual…");
- tríades de adjetivos e frases de efeito sem conteúdo;
- promessa vaga ("revolucionar", "transformar", "potencializar") sem dizer o quê e como.
