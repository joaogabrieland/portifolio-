-- ============================================================
--  CREATOR FLOW — Seed de usuário de teste (local)
--  Email  : teste@creatorflowia.com
--  Senha  : miguelzim1
--  Plano  : agency (ativo por 1 ano)
-- ============================================================
--
--  Como usar:
--    psql -d creatorflow -f seed-usuario-teste.sql
--
--  Ou se quiser rodar no banco remoto (Supabase):
--    psql "postgresql://postgres:SENHA@db.SEU_ID.supabase.co:5432/postgres" -f seed-usuario-teste.sql
-- ============================================================

BEGIN;

-- 1. Remove o usuário se já existir (para poder rodar o script mais de uma vez)
DELETE FROM subscriptions
WHERE user_id = (SELECT id FROM users WHERE email = 'teste@creatorflowia.com');

DELETE FROM users WHERE email = 'teste@creatorflowia.com';

-- 2. Cria o usuário
--    Senha "miguelzim1" — hash gerado com bcrypt 12 rounds
INSERT INTO users (
  name,
  email,
  password_hash,
  cpf_cnpj
) VALUES (
  'Admin Teste',
  'teste@creatorflowia.com',
  '$2b$12$RfjHZ2ovUlRnQcpsZJky9u0VYOySOxYLMoSS6dZ4JHZBkZBzh9Nqa',
  '00000000000'
);

-- 3. Cria a assinatura ativa no plano Agency por 1 ano
INSERT INTO subscriptions (
  user_id,
  plan,
  status,
  current_period_start,
  current_period_end
) VALUES (
  (SELECT id FROM users WHERE email = 'teste@creatorflowia.com'),
  'agency',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year'
);

COMMIT;

-- 4. Confirma o resultado
SELECT
  u.id,
  u.name,
  u.email,
  s.plan,
  s.status,
  s.current_period_end::DATE AS expira_em
FROM users u
JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'teste@creatorflowia.com';
