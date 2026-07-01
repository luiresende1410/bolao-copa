# ⚽ Bolão Copa do Mundo 2026

Aplicação web para gerenciar um bolão da Copa do Mundo 2026 entre amigos, família ou colegas de trabalho.

## 📁 Estrutura do Projeto

```
├── index.html           # Página principal (HTML estrutural)
├── css/
│   └── styles.css       # Estilos separados
├── js/
│   ├── dados.js         # Dados dos 104 jogos e constantes
│   └── app.js           # Lógica da aplicação
├── firebase-rules.json  # Regras de segurança para o Firebase
└── README.md
```

## 🚀 Como Usar

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o **Realtime Database**
3. Copie o `firebaseConfig` e cole no arquivo `js/app.js`
4. Aplique as regras de segurança do `firebase-rules.json` no console do Firebase
5. Hospede os arquivos (Firebase Hosting, GitHub Pages, Netlify, etc.)

## 🔒 Segurança

- Senhas são hasheadas com SHA-256 no client
- Validação de entrada contra caracteres especiais do Firebase (`.`, `#`, `$`, `[`, `]`, `/`)
- Validação de scores (0-99)
- Operações admin protegidas por autenticação
- Regras de segurança do Firebase para validação server-side

### Aplicar regras de segurança

No Firebase Console → Realtime Database → Rules, cole o conteúdo de `firebase-rules.json`.

## 📌 Funcionalidades

- 104 jogos (72 fase de grupos + 32 mata-mata)
- Sistema de pontuação: Na Mosca (20), Antenado (10), Melhor que Nada (5), Pênaltis (10)
- Ranking com desempate e filtro por grupo
- Bloqueio automático de palpites 10min antes do jogo
- Chaveamento visual do mata-mata
- Avanço automático de times
- Grupos de apostadores com rankings separados
- Interface responsiva e acessível (ARIA, teclado, skip-link)
