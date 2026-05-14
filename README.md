# Hub OS — Sistema de Gestão de Ordens de Serviço em Campo

Sistema web completo para gerenciamento de Ordens de Serviço de campo, desenvolvido para a empresa **Audicom**. Funciona 100% no navegador, sem instalação, sem servidor próprio e com dados em tempo real via Firebase Firestore.

---

## Funcionalidades

### Painel do Gestor
- **Dashboard** com visão geral das OSs do dia por técnico
- **Criar OS** com preenchimento automático ao colar texto do HubSoft
- **Atribuir OS** a um ou mais técnicos com data e horário
- **Mapa de atribuição** com visualização geográfica das OSs no dia
- **Gestão de técnicos** — cadastrar, editar, definir senha e excluir
- **Filtro por dia** — ontem, hoje, amanhã, depois ou data personalizada
- **Agenda completa** por técnico com resumo de todas as OSs
- **Encerrar ou reabrir** qualquer OS independente do status
- **Excluir OS** a qualquer momento

### Visão do Técnico
- Login individual com senha opcional por técnico
- **Mão do técnico** — lista das OSs do dia com todos os detalhes
  - Código HubSoft, cliente, ponto, falha, telefone, disponibilidade, responsável, local, protocolos HubSoft e James
  - Filtro por dia e agenda completa
- **Ver Rota do Dia** — mapa interativo in-page (Leaflet) com marcadores numerados e linha de rota conectando todos os pontos do dia
- **Encerrar OS** diretamente pelo celular com:
  - Resumo do reparo (notas de execução)
  - Assinatura digital do cliente (canvas touch)
- Histórico de OSs concluídas com todos os dados de encerramento e assinatura

### Preenchimento Automático
Cole o texto do HubSoft no campo automático e os campos da OS são preenchidos instantaneamente:
- Código, cliente, ponto, falha, telefone, disponibilidade, responsável, local, protocolos, coordenadas

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + Tailwind CSS (CDN) |
| Lógica | JavaScript puro (sem framework) |
| Banco de dados | Firebase Firestore (SDK compat 9.23.0) |
| Mapas | Leaflet.js 1.9.4 + OpenStreetMap |
| Ícones | FontAwesome 6.5 |
| Hospedagem | GitHub Pages |

---

## Estrutura do Projeto

```
index.html        — app completo (HTML + CSS + JS em página única)
firebase.js       — credenciais do Firebase (não commitar em repositórios públicos)
style.css         — estilos globais auxiliares
script.js         — arquivo JS auxiliar
FIREBASE-SETUP.md — guia passo a passo para configurar o Firebase
```

### Coleções no Firestore

| Coleção | O que armazena |
|---------|---------------|
| `tecnicos` | Nome, função, cor e senha de cada técnico |
| `oss` | Todas as ordens de serviço e seus dados completos |
| `config` | Contador sequencial de OS (OS-101, OS-102…) |

---

## Como Usar

### 1. Configure o Firebase

Siga o guia detalhado em [`FIREBASE-SETUP.md`](./FIREBASE-SETUP.md) para:
- Criar um projeto no Firebase Console
- Ativar o Firestore Database
- Configurar as regras de segurança
- Copiar as credenciais

### 2. Cole as credenciais

Abra `firebase.js` e preencha com os dados do seu projeto:

```js
const firebaseConfig = {
    apiKey:            "sua-api-key",
    authDomain:        "seu-projeto.firebaseapp.com",
    projectId:         "seu-projeto",
    storageBucket:     "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId:             "1:123456789:web:abcdef"
};
```

### 3. Hospede no GitHub Pages

1. Suba os arquivos para um repositório público no GitHub
2. Vá em **Settings → Pages**
3. Selecione branch `main` e pasta `/root`
4. Acesse pelo link gerado pelo GitHub Pages

---

## Screenshots

> Gestor — Dashboard com OSs do dia por técnico

> Técnico — Tela de execução e encerramento de OS com assinatura

> Mapa de rota do dia com marcadores numerados e linha de percurso

---

## Regras de Segurança do Firestore

O sistema usa as seguintes regras mínimas (acesso aberto às três coleções):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tecnicos/{id} { allow read, write: if true; }
    match /oss/{id}      { allow read, write: if true; }
    match /config/{id}   { allow read, write: if true; }
  }
}
```

---

## Desenvolvido para

**Audicom** — empresa de serviços em campo.  
Sistema desenvolvido para uso interno da equipe técnica.

---

## Licença

Uso privado. Não licenciado para redistribuição.
