# Hub OS — Configuração Firebase (Definitivo)

---

## PASSO 1 — Criar o Projeto

1. Acesse **https://console.firebase.google.com**
2. Clique em **"Adicionar projeto"**
3. Nome do projeto: `hub-os` (ou o nome que quiser)
4. **Desmarque** o Google Analytics → clique em **"Criar projeto"**
5. Aguarde e clique em **"Continuar"**

---

## PASSO 2 — Registrar o App Web

1. Na tela inicial, clique no ícone **`</>`** (Web)
2. Apelido do app: `hub-os`
3. **Não marque** Firebase Hosting → clique em **"Registrar app"**
4. Vai aparecer um bloco assim — **copie tudo** entre as chaves:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "hub-os.firebaseapp.com",
  projectId: "hub-os",
  storageBucket: "hub-os.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

5. Clique em **"Continuar no console"**

---

## PASSO 3 — Criar o Banco de Dados Firestore

1. No menu lateral: **Build → Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Na tela de modo, selecione **"Iniciar no modo de produção"**

   > Isso cria o banco bloqueado por padrão. Vamos abrir só o necessário no próximo passo.

4. Região: **`southamerica-east1` (São Paulo)**
5. Clique em **"Ativar"** e aguarde

---

## PASSO 4 — Configurar as Regras de Segurança

1. Dentro do Firestore, clique na aba **"Regras"**
2. **Apague tudo** que está lá e cole exatamente isto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tecnicos/{id} {
      allow read, write: if true;
    }
    match /oss/{id} {
      allow read, write: if true;
    }
    match /config/{id} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em **"Publicar"**

> Essas regras permitem acesso apenas às coleções usadas pelo sistema (`tecnicos`, `oss`, `config`). Qualquer outra coleção fica bloqueada. Não expiram nunca.

---

## PASSO 5 — Colar as Credenciais no HTML

1. Abra o arquivo **`gestao-unificada.html`** em qualquer editor de texto (Bloco de Notas, VS Code, etc.)
2. Procure este trecho perto do final do arquivo (dentro da tag `<script>`):

```js
const firebaseConfig = {
    apiKey:            "",
    authDomain:        "",
    projectId:         "",
    storageBucket:     "",
    messagingSenderId: "",
    appId:             ""
};
```

3. Preencha com os dados que você copiou no Passo 2:

```js
const firebaseConfig = {
    apiKey:            "AIzaSy...",
    authDomain:        "hub-os.firebaseapp.com",
    projectId:         "hub-os",
    storageBucket:     "hub-os.appspot.com",
    messagingSenderId: "123456789",
    appId:             "1:123456789:web:abcdef"
};
```

4. **Salve o arquivo**

---

## PASSO 6 — Publicar no GitHub Pages

### 6.1 — Criar o repositório

1. Acesse **https://github.com/new**
2. Nome: `hub-os`
3. Visibilidade: **Public**
4. Clique em **"Create repository"**

### 6.2 — Enviar o arquivo

Na página do repositório recém-criado:

1. Clique em **"uploading an existing file"**
2. Arraste o arquivo **`gestao-unificada.html`**
3. Em "Commit changes" deixe a mensagem padrão e clique em **"Commit changes"**

### 6.3 — Ativar o Pages

1. Clique em **"Settings"** (aba no topo do repositório)
2. No menu lateral, clique em **"Pages"**
3. Em **Source**, selecione:
   - Branch: `main`
   - Pasta: `/ (root)`
4. Clique em **"Save"**
5. Aguarde ~1 minuto

Seu site estará disponível em:
```
https://SEU_USUARIO.github.io/hub-os/gestao-unificada.html
```

---

## Teste Final

Após tudo configurado:

1. Abra o link do GitHub Pages
2. A tela de login deve aparecer normalmente (sem erros)
3. Entre como **Gestor** → vá em **Técnicos & Agenda** → adicione um técnico
4. Vá em **Dashboard** → crie uma OS
5. Abra o **console Firebase → Firestore → Dados** — os registros devem aparecer lá

Se tudo aparece no Firestore, o sistema está 100% funcional.

---

## Se o Firestore mostrar erro de permissão

Volte ao **Passo 4** e verifique se as regras foram publicadas corretamente.
Às vezes o Firebase demora ~1 minuto para propagar as regras novas.

---

## Estrutura criada automaticamente no Firestore

O sistema cria tudo sozinho na primeira vez que você usa:

| Coleção | O que guarda |
|---------|-------------|
| `tecnicos` | Nome, função e cor de cada técnico |
| `oss` | Todas as ordens de serviço |
| `config` | Contador sequencial de OS (OS-101, OS-102...) |
