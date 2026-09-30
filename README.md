# ImóveisApp 🏠

Plataforma completa para corretores de imóveis publicarem e gerenciarem seus imóveis.

## Stack
- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **Banco de dados**: Supabase (PostgreSQL + Auth + RLS)
- **Imagens**: Cloudinary
- **Estilo**: Tailwind CSS
- **Deploy**: Vercel

## Funcionalidades

### Gestor
- Dashboard com estatísticas
- Gerenciamento completo de corretores
- Aprovar/rejeitar/ativar/desativar corretores
- Visualizar todos os imóveis
- Link do catálogo geral

### Corretor
- Cadastro com aprovação do gestor
- Publicar imóveis com fotos, descrições e valores
- Link próprio do catálogo
- Botão de copiar link individual de cada imóvel

### Clientes (público)
- Visualizar todos os imóveis
- Filtrar por tipo, finalidade e cidade
- Ver catálogo por corretor
- Contato via WhatsApp com dados do imóvel pré-preenchidos

## Setup do Banco (Supabase)

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo do arquivo `supabase/schema.sql`

## Criar primeiro Gestor

1. Supabase Dashboard → **Authentication** → **Users** → **Add User**
2. Defina email e senha do gestor
3. Copie o UUID gerado
4. No SQL Editor execute:
```sql
INSERT INTO perfis (id, papel, nome, email)
VALUES ('UUID-AQUI', 'gestor', 'Nome do Gestor', 'email@gestor.com');
```

## Deploy no Vercel

1. Faça push do repositório para o GitHub
2. Acesse vercel.com e importe o repositório
3. Adicione as variáveis de ambiente do `.env.example`
4. Deploy automático!

## Rotas

| Rota | Descrição |
|------|-----------|
| `/login` | Login |
| `/cadastro` | Registro de corretor |
| `/gestor` | Dashboard do gestor |
| `/gestor/corretores` | Gerenciar corretores |
| `/corretor` | Dashboard do corretor |
| `/corretor/imoveis` | Meus imóveis |
| `/corretor/imoveis/novo` | Novo imóvel |
| `/c` | Catálogo público geral |
| `/c/[slug]` | Catálogo do corretor |
| `/c/[slug]/[codigo]` | Página do imóvel |
