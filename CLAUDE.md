# Hub OS — Guia para IA

## Contexto do projeto

Sistema de gestão de Ordens de Serviço em campo da empresa Audicom.
Frontend: página única HTML (`index.html`) com Tailwind CSS e lógica embutida no próprio HTML.
Backend: **Firebase Firestore** (SDK compat v9.23.0) — sem servidor, sem build step.
Hospedagem: **GitHub Pages** (produção ativa). Qualquer commit na branch `main` vai direto para o ar.

## Regra obrigatória antes de qualquer edição

**Antes de finalizar qualquer alteração, avalie se ela impacta o Firebase.**
O site está em produção com usuários reais. Mudanças que quebram a integração com o Firestore causam indisponibilidade imediata.

Pergunte-se:

1. **Coleções** — a edição cria, renomeia ou remove alguma coleção do Firestore?
   - Coleções atuais: `tecnicos`, `oss`, `config`
   - As regras de segurança do Firestore só permitem acesso a essas três. Qualquer nova coleção precisa ser adicionada às regras manualmente pelo dono do projeto.

2. **Estrutura de documentos** — a edição muda campos que são salvos ou lidos do Firestore?
   - Se sim, documentos já existentes em produção podem não ter o campo novo, causando erros silenciosos ou crashes.
   - Avise o usuário e sugira tratamento de valor ausente (`|| null`, `?? ''`, etc.).

3. **Regras de segurança** — a edição exige uma nova permissão no Firestore?
   - Ex.: nova coleção, autenticação de usuário, restrição por UID.
   - Se sim, indique exatamente qual trecho das regras precisa ser adicionado/alterado no console do Firebase (`console.firebase.google.com → Firestore → Regras`).

4. **Credenciais** — nunca remova, sobrescreva ou exponha o objeto `firebaseConfig` sem instrução explícita do usuário.

5. **SDK** — não atualize a versão do SDK Firebase sem avisar. A versão atual (`9.23.0 compat`) é intencional.

## Estrutura do projeto

```
index.html   — app completo (HTML + CSS inline + JS inline + Firebase SDK)
script.js    — arquivo auxiliar (verificar uso antes de editar)
style.css    — estilos globais externos
FIREBASE-SETUP.md — guia de configuração do Firebase para o usuário
```

## Coleções Firestore e estrutura esperada

| Coleção    | Propósito                              | Campos principais                  |
|------------|----------------------------------------|------------------------------------|
| `tecnicos` | Cadastro de técnicos de campo          | `nome`, `funcao`, `cor`, `criadoEm` |
| `oss`      | Ordens de serviço                      | `numero`, `cliente`, `status`, `tecnico`, `criadoEm`, etc. |
| `config`   | Configurações globais do app           | `doc('app')` com `contadorOS`      |

## Regras de segurança atuais no Firestore

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

Se adicionar nova coleção, o usuário precisa incluir o bloco correspondente e republicar as regras.

## Checklist de entrega

Antes de reportar uma tarefa como concluída, confirme:

- [ ] A integração com o Firestore continua funcionando para as 3 coleções existentes
- [ ] Nenhum campo obrigatório do Firestore foi removido sem tratamento de compatibilidade
- [ ] Se houver nova coleção: avisar o usuário para atualizar as regras do Firestore
- [ ] Se houver mudança de estrutura de documento: avisar sobre dados legados em produção
- [ ] O objeto `firebaseConfig` está intacto no `index.html`
