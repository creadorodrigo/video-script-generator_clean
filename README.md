# Video Script Generator

Sistema de geração inteligente de roteiros de vídeo usando IA.

## 🚀 Setup Rápido

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="sua-secret-key"
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

### 2. Banco de Dados (Supabase)

Execute este SQL no Supabase:

```sql
-- Criar tabelas
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    generations_used INTEGER DEFAULT 0,
    last_reset TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE video_patterns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_urls JSONB NOT NULL,
    analysis JSONB NOT NULL,
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_scripts (
    id TEXT PRIMARY KEY,
    new_theme JSONB NOT NULL,
    settings JSONB NOT NULL,
    scripts JSONB NOT NULL,
    consolidated_analysis JSONB NOT NULL,
    pattern_id TEXT REFERENCES video_patterns(id) ON DELETE SET NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_video_patterns_user_id ON video_patterns(user_id);
CREATE INDEX idx_generated_scripts_user_id ON generated_scripts(user_id);

-- Criar usuário
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, email, name, password)
VALUES (
    gen_random_uuid()::text,
    'seu-email@example.com',
    'Seu Nome',
    crypt('sua-senha', gen_salt('bf', 12))
);
```

## ✅ Status

- [x] Interface funcional
- [x] Formulários de entrada
- [x] Validações
- [ ] Backend API (próximo passo)
- [ ] Integração Claude
- [ ] Autenticação

## 📦 Deploy

Este projeto está pronto para deploy na Vercel!

1. Conecte o repositório GitHub na Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

## 🎯 Custo Estimado

~$0.12/mês para 20 gerações usando Claude Haiku
