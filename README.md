# PokeDock — site

Landing page em React, TypeScript e Vite, pronta para publicar pela Vercel a partir de um repositório próprio. O layout usa as cores, o visor e os sprites do app para macOS.

O site está disponível em português e inglês. A primeira visita usa o idioma do navegador; os botões PT/EN no cabeçalho permitem trocar a qualquer momento e a escolha fica salva neste navegador. O título, a descrição, os textos de acessibilidade e a interface de consentimento acompanham o idioma.

## Desenvolvimento local

Requer Node.js 24 (arquivo `.nvmrc`).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

O `firebaseConfig` enviado para o projeto está em `.env.local`, que **não é versionado**. Para gerar a versão de produção:

```bash
npm run build
```

O resultado está em `dist/`.

## Firebase Analytics

O app Web do projeto Firebase `pokedock-3ca5c` já foi configurado com os dados fornecidos. Confirme que o Google Analytics está habilitado nesse projeto. O site usa as variáveis `VITE_FIREBASE_*` de `.env.local`.

O SDK é carregado somente após o visitante aceitar analytics. O Firebase registra visitas à página; o site também registra `theme_preview` quando alguém troca o tema da prévia e `download_click` quando clica num link de DMG ativo. O visitante pode recusar ou mudar a escolha pelo rodapé. Sem as variáveis `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_PROJECT_ID` e `VITE_FIREBASE_MEASUREMENT_ID`, a coleta fica desligada.

As configurações Web do Firebase são identificadores públicos no bundle do navegador, mesmo quando entram pelo ambiente de build. Não coloque chaves privadas ou credenciais administrativas em variáveis `VITE_*`.

## Publicar na Vercel

1. Envie **o conteúdo desta pasta** para o repositório GitHub separado do site.
2. Importe esse repositório na Vercel. Use framework **Vite**, Node.js **24.x**, comando `npm run build` e pasta de saída `dist` (também declarados em `vercel.json`).
3. Nas configurações do projeto Vercel, adicione as variáveis `VITE_FIREBASE_*` com os mesmos valores de `.env.local` para Production. Depois faça um novo deploy.
4. Quando existir um DMG da versão atual, assinado e notarizado, defina `VITE_DOWNLOAD_URL` como a URL HTTPS do arquivo e faça novo deploy. Até lá, os botões informam “Download em breve”.

## Conteúdo e recursos

O texto de instalação descreve o estado atual do aplicativo, incluindo o requisito de macOS 27 ou posterior. A barra é uma janela própria; ela pode ocultar automaticamente a Dock do macOS, sem substituí-la.

Sprites locais foram copiados dos assets do app, originalmente obtidos de [PokeAPI/sprites](https://github.com/PokeAPI/sprites). A atribuição à fonte não concede direitos sobre os personagens Pokémon; verifique as permissões de uso antes de publicar o site e o aplicativo.
