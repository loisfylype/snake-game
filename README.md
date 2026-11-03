# Snake

Jogo da cobrinha em React, inspirado nos celulares Nokia antigos.

## Rodar localmente

Com Node.js 20, no PowerShell:

```powershell
npm ci
npm start
```

Abra [localhost:3000](http://localhost:3000). Use as setas ou os botões na tela para virar. Espaço inicia, pausa e retoma a partida. A cobra acelera conforme come, e o recorde fica salvo no navegador.

Para rodar o teste, use `npm test -- --watchAll=false`. Para gerar a versão de produção, use `npm run build`.

## Modos

- **Normal** — atravessar qualquer borda leva a cobra ao lado oposto.
- **Difícil** — a cobra começa mais rápida e as bordas são fechadas com blocos.
- **Arcade** — cada partida gera plataformas, colunas e passagens entre bordas opostas.
