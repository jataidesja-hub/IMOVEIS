-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (fresh setup)
DROP TABLE IF EXISTS imoveis CASCADE;
DROP TABLE IF EXISTS corretores CASCADE;
DROP TABLE IF EXISTS perfis CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Perfis table (linked to Supabase Auth)
CREATE TABLE perfis (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  papel TEXT NOT NULL CHECK (papel IN ('gestor', 'corretor')),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corretores table
CREATE TABLE corretores (
  id UUID REFERENCES perfis(id) ON DELETE CASCADE PRIMARY KEY,
  cpf TEXT,
  creci TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  slug TEXT UNIQUE NOT NULL,
  whatsapp TEXT NOT NULL,
  foto_perfil TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imoveis table
CREATE TABLE imoveis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  corretor_id UUID REFERENCES corretores(id) ON DELETE CASCADE NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('casa', 'apartamento', 'terreno', 'comercial', 'chacara', 'outros')),
  finalidade TEXT NOT NULL CHECK (finalidade IN ('venda', 'aluguel')),
  preco NUMERIC(15,2) NOT NULL,
  preco_condominio NUMERIC(15,2),
  preco_iptu NUMERIC(15,2),
  endereco TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  quartos INTEGER DEFAULT 0,
  suites INTEGER DEFAULT 0,
  banheiros INTEGER DEFAULT 0,
  vagas_garagem INTEGER DEFAULT 0,
  area_total NUMERIC(10,2),
  area_construida NUMERIC(10,2),
  fotos JSONB DEFAULT '[]',
  caracteristicas JSONB DEFAULT '[]',
  publicado BOOLEAN DEFAULT FALSE,
  destaque BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER imoveis_updated_at
  BEFORE UPDATE ON imoveis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER corretores_updated_at
  BEFORE UPDATE ON corretores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE corretores ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;

-- Perfis RLS
CREATE POLICY "perfis_select_own" ON perfis FOR SELECT USING (auth.uid() = id);
CREATE POLICY "perfis_insert_own" ON perfis FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "perfis_update_own" ON perfis FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "perfis_gestor_all" ON perfis FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.papel = 'gestor'));

-- Corretores RLS
CREATE POLICY "corretores_public_read" ON corretores FOR SELECT USING (true);
CREATE POLICY "corretores_insert_own" ON corretores FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "corretores_update_own" ON corretores FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "corretores_gestor_all" ON corretores FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.papel = 'gestor'));

-- Imoveis RLS
CREATE POLICY "imoveis_public_read" ON imoveis FOR SELECT USING (
  publicado = true AND
  EXISTS (
    SELECT 1 FROM corretores c
    WHERE c.id = corretor_id AND c.ativo = true AND c.status = 'aprovado'
  )
);
CREATE POLICY "imoveis_corretor_own" ON imoveis FOR ALL USING (auth.uid() = corretor_id);
CREATE POLICY "imoveis_gestor_all" ON imoveis FOR ALL
  USING (EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.papel = 'gestor'));

-- Auto-create perfil on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'papel' IS NOT NULL THEN
    INSERT INTO perfis (id, papel, nome, email, telefone)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'papel',
      COALESCE(NEW.raw_user_meta_data->>'nome', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'telefone'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create first gestor manually:
-- 1. Go to Supabase Dashboard > Authentication > Users > Add User
-- 2. Set email and password
-- 3. Run: INSERT INTO perfis (id, papel, nome, email) VALUES ('USER_UUID_HERE', 'gestor', 'Nome Gestor', 'email@gestor.com');
