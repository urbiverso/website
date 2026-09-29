# CLAUDE.md — site urbiverso.com.br

Este repositório é **público**. O histórico também: o que for commitado fica visível para sempre, mesmo se apagado depois.

## Regras

- **Nada de infraestrutura no site nem no repositório:** nenhum codinome de host, IP, nome de cliente, trecho de documentação interna da plataforma ou credencial. Só entra aqui o que pode ir ao ar.
  A única credencial que mora aqui é a **URL de entrada do formulário** (`conhecer/`), porque o navegador precisa dela para enviar: ela é pública por natureza. Trocar a URL é revogar o ingresso no hub e publicar a nova aqui.
- **Commits com e-mail noreply do GitHub** (`git config user.email` local deste clone).
- **Site estático, sem build:** HTML, CSS e JS puros. Mobile-first; toda animação respeita `prefers-reduced-motion`.
- **Formulário:** é do próprio site e faz `POST` direto na URL de entrada de uma campanha do app de leads no hub. A origem do site precisa estar liberada no CORS dos webhooks do hub. Outras partes interativas, se vierem, entram como `<iframe>` de páginas públicas do hub com embed liberado para este domínio.
- **Identidade visual** parte do material de marca da plataforma (logo galáxia/engrenagem).

## Texto: sem AI slop

O conteúdo nasce das frases do Ricardo. Quem edita ajusta ritmo, não inventa tese. Proibido:
- abertura genérica ("num mundo cada vez mais…", "no cenário atual…");
- tríades de adjetivos e frases de efeito sem conteúdo;
- promessa vaga ("revolucionar", "transformar", "potencializar") sem dizer o quê e como.
