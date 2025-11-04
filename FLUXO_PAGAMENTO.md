# 📋 Fluxo Completo de Pagamento - Plano Premium

## 🔗 URLs e Configurações

- **URL de Pagamento**: https://pay.kiwify.com.br/X8t3oZm
- **Webhook URL**: https://ucnajqoapngtearuafkv.supabase.co/functions/v1/kiwify-webhook
- **Token de Segurança**: 33codiyu0ng (configurado como `KIWIFY_WEBHOOK_SECRET`)

## 🔄 Fluxo Completo

### 1. **Usuário Clica em "Assinar Plano Premium"**
**Arquivo**: `src/components/settings/PlanUpgrade.tsx`

```typescript
handleUpgrade() → supabase.functions.invoke('get-checkout-url')
```

**Ação**: 
- Chama a edge function `get-checkout-url`
- Exibe toast: "🚀 Redirecionando para o pagamento..."

---

### 2. **Edge Function Retorna URL do Checkout**
**Arquivo**: `supabase/functions/get-checkout-url/index.ts`

```typescript
URL retornada: https://pay.kiwify.com.br/X8t3oZm?email={user.email}
```

**Ação**:
- Autentica o usuário via Supabase Auth
- Retorna o link da Kiwify com email pré-preenchido
- Redireciona o navegador para a página de pagamento

---

### 3. **Usuário Completa o Pagamento na Kiwify**
**Plataforma**: Kiwify (externa)

**Ação**:
- Usuário preenche dados do cartão
- Confirma pagamento
- Kiwify processa a transação

---

### 4. **Kiwify Envia Webhook para o Supabase**
**Arquivo**: `supabase/functions/kiwify-webhook/index.ts`

**Eventos Processados**:

#### ✅ Eventos POSITIVOS (ativam Premium):
- `aprovada`
- `criada`
- `paga`
- `completa`
- `renovada`

#### ❌ Eventos NEGATIVOS (desativam Premium):
- `cancelada`
- `atrasada`
- `expirada`
- `reembolsada`
- `chargeback`

**Ação ao receber evento positivo**:
```sql
UPDATE profiles 
SET 
  plan = 'premium',
  subscription_end = NOW() + INTERVAL '30 days'
WHERE id = {user_id}
```

**Logs salvos em**: `webhook_logs` table

---

### 5. **Sistema Atualiza Perfil do Usuário**
**Tabela**: `profiles`

**Campos atualizados**:
- `plan`: `'free'` → `'premium'`
- `subscription_end`: Data atual + 30 dias

---

### 6. **Frontend Detecta Atualização Automática**
**Arquivo**: `src/pages/Thanks.tsx`

**Ação**:
- Refetch imediato ao carregar a página
- Polling a cada 3 segundos por até 30 segundos
- Quando detecta `plan = 'premium'`:
  - Exibe toast: "🎉 Plano Premium ativo!"
  - Libera acesso a recursos premium

---

### 7. **Usuário Tem Acesso aos Recursos Premium**

**Recursos Liberados**:
- ✅ Lançamentos ilimitados
- ✅ Dashboard completo
- ✅ Relatórios avançados
- ✅ Exportação de dados
- ✅ Suporte prioritário
- ✅ Categorização avançada

**Rotas Desbloqueadas**:
- `/premium` - Área exclusiva premium
- `/transacoes` - Sem limite de lançamentos
- `/relatorios` - Exportação habilitada

---

## 🧪 Simulação de Eventos

### Teste 1: Pagamento Aprovado
```json
POST /functions/v1/kiwify-webhook
{
  "email": "usuario@exemplo.com",
  "evento": "Assinatura aprovada",
  "produto": "Plano Premium MEI",
  "token": "33codiyu0ng"
}
```
**Resultado esperado**: 
- ✅ `plan` = `'premium'`
- ✅ `subscription_end` = hoje + 30 dias
- ✅ Toast: "🎉 Plano Premium ativo!"

---

### Teste 2: Assinatura Cancelada
```json
POST /functions/v1/kiwify-webhook
{
  "email": "usuario@exemplo.com",
  "evento": "Assinatura cancelada",
  "produto": "Plano Premium MEI",
  "token": "33codiyu0ng"
}
```
**Resultado esperado**:
- ⬇️ `plan` = `'free'`
- ⬇️ `subscription_end` = `null`
- ⚠️ Toast: "Sua assinatura foi cancelada"

---

### Teste 3: Assinatura Expirada
```json
POST /functions/v1/kiwify-webhook
{
  "email": "usuario@exemplo.com",
  "evento": "Assinatura expirada",
  "produto": "Plano Premium MEI",
  "token": "33codiyu0ng"
}
```
**Resultado esperado**:
- ⬇️ `plan` = `'free'`
- ⬇️ `subscription_end` = `null`
- ⚠️ Toast: "Plano Premium expirado"

---

## 📁 Arquivos Modificados

### Edge Functions
1. ✅ `supabase/functions/get-checkout-url/index.ts` - Retorna URL de checkout
2. ✅ `supabase/functions/kiwify-webhook/index.ts` - Processa webhooks

### Frontend
3. ✅ `src/components/settings/PlanUpgrade.tsx` - Botão de upgrade
4. ✅ `src/pages/Thanks.tsx` - Página de agradecimento com polling
5. ✅ `src/contexts/finance/hooks/useUserSettings.ts` - Toast de boas-vindas

### Rotas
6. ✅ `src/App.tsx` - Rota `/premium` protegida
7. ✅ `src/components/auth/RequirePremium.tsx` - Proteção de rota premium

---

## 🔐 Segurança

- ✅ Webhook valida token `KIWIFY_WEBHOOK_SECRET`
- ✅ Edge function `get-checkout-url` requer autenticação JWT
- ✅ RLS policies protegem tabela `profiles`
- ✅ Logs de todos os webhooks salvos em `webhook_logs`

---

## ✅ Checklist de Funcionalidade

- [x] Botão redireciona para Kiwify com email pré-preenchido
- [x] Webhook recebe e valida token de segurança
- [x] Webhook atualiza plano para Premium em eventos positivos
- [x] Webhook rebaixa plano para Free em eventos negativos
- [x] Frontend detecta atualização automaticamente (polling)
- [x] Toast de confirmação exibido após ativação
- [x] Rota `/premium` protegida por `RequirePremium`
- [x] Recursos premium desbloqueados imediatamente
- [x] Logs salvos para auditoria

---

## 🎯 Resumo

**Fluxo simplificado**:
```
Botão Upgrade → get-checkout-url → Kiwify → Pagamento 
→ Webhook → Atualiza DB → Frontend detecta → Libera Premium
```

**Tempo médio**: 5-15 segundos entre pagamento e liberação
**Validade**: 30 dias (renovável)
