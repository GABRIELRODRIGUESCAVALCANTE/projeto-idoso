# Tradutor de Burocracia & Saúde 🇧🇷
### Decodificador Acessível de Documentos Cidadãos com IA Multimodal

Projeto de extensão universitária voltado para o impacto social e a inclusão cidadã de idosos e pessoas com baixo letramento funcional. A aplicação decodifica termos burocráticos, contas públicas e receitas médicas para linguagem simples, direta e humana, contando com recurso nativo de leitura em voz alta.

---

## 📁 Estrutura do Projeto

```
projeto-extensao/
├── backend/
│   ├── .env.example              # Exemplo de configuração de variáveis
│   ├── .env                      # Arquivo local com sua GEMINI_API_KEY
│   ├── package.json              # Dependências (Express, @google/genai, multer, cors)
│   ├── server.js                 # Servidor Express e rota POST /api/analyze-document
│   ├── prompts/
│   │   └── documentPrompt.js     # System Prompt empático e Schema estruturado
│   └── services/
│       └── geminiService.js      # Integração oficial com Google GenAI (gemini-2.5-flash)
│
├── frontend/
│   ├── package.json              # Dependências (React, Vite, Tailwind CSS, Lucide Icons)
│   ├── vite.config.js            # Configuração do Vite com proxy para o backend
│   ├── tailwind.config.js        # Design tokens e tipografia de alta legibilidade
│   ├── index.html                # Ponto de entrada com meta tags de acessibilidade
│   └── src/
│       ├── main.jsx
│       ├── App.jsx               # Orquestrador da interface e tratamento de estados
│       ├── index.css             # Estilos globais e foco acessível
│       ├── utils/
│       │   └── speech.js         # Wrapper resiliente para a Web Speech API
│       └── components/
│           ├── Header.jsx        # Cabeçalho com controle de tamanho de fonte
│           ├── DocumentUploader.jsx # Botões táteis grandes para câmera/upload
│           ├── LoadingState.jsx  # Feedback acolhedor durante a leitura
│           ├── AudioPlayer.jsx   # Reprodutor de áudio acessível (Play/Pause/Velocidade)
│           └── ResultCard.jsx    # Exibição clara (o que é, prazos, valores, ética)
│
└── README.md
```

---

## 🚀 Como Executar Localmente

### 1. Backend

1. Abra a pasta `backend`:
   ```bash
   cd backend
   ```
2. Adicione sua chave da API do Google Gemini no arquivo `.env`:
   ```env
   PORT=3001
   GEMINI_API_KEY=coloque_sua_chave_aqui
   ```
   *(Você pode obter sua chave gratuitamente no [Google AI Studio](https://aistudio.google.com/))*
3. Inicie o servidor:
   ```bash
   npm run dev
   ```
   O backend responderá em `http://localhost:3001`.

---

### 2. Frontend

1. Em outro terminal, abra a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Inicie o servidor Vite:
   ```bash
   npm run dev
   ```
3. Abra seu navegador em `http://localhost:5173`.

---

## ♿ Destaques de Acessibilidade e Inclusão

- **Mobile-first com áreas de toque ampliadas:** Botões maiores que 50px facilitam o uso por idosos ou pessoas com tremores nas mãos.
- **Web Speech API nativa:** Reproduz a explicação em áudio em português sem consumir APIs pagas de terceiros e sem latência.
- **Controle de tamanho de fonte (A- / A+):** Facilita a leitura para pessoas com baixa acuidade visual.
- **Privacidade total por padrão:** Os documentos recebidos são analisados em memória RAM (`multer.memoryStorage`) e nunca são salvos em disco permanente.
- **Responsabilidade Ética:** Receitas médicas e ordens judiciais trazem alertas explícitos para validação com profissionais qualificados.
