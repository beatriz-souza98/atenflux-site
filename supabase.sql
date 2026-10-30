create table if not exists public.agendamentos (
  id              bigint generated always as identity primary key,
  criado_em       timestamptz not null default now(),
  nome            text        not null check (char_length(nome) between 1 and 120),
  whatsapp        text        not null check (char_length(whatsapp) between 8 and 30),
  email           text        check (email is null or char_length(email) <= 200),
  negocio         text        check (negocio is null or char_length(negocio) <= 200),
  plano           text        not null check (plano in ('Ainda não sei', 'Chatbot', 'Chatbot + Site', 'Completo')),
  dia_preferido   text        not null check (dia_preferido in ('Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira')),
  horario         text        not null check (char_length(horario) <= 10),
  mensagem        text        check (mensagem is null or char_length(mensagem) <= 2000),
  status          text        not null default 'novo' check (status in ('novo', 'contatado', 'agendado', 'fechado', 'descartado'))
);

-- Segurança: ativa as regras por linha (RLS).
alter table public.agendamentos enable row level security;

-- O visitante do site (chave anon) pode apenas INSERIR um pedido novo,
-- e só com status "novo". Ele NÃO consegue ler, alterar nem apagar nada.
drop policy if exists "site pode inserir pedidos" on public.agendamentos;
create policy "site pode inserir pedidos"
  on public.agendamentos
  for insert
  to anon
  with check (status = 'novo');

-- Permissões: sem isso o site recebe "permission denied" (erro 401, código 42501).
-- Libera SOMENTE inserir. Ler, alterar e apagar continuam bloqueados para o visitante.
grant usage on schema public to anon;
grant insert on public.agendamentos to anon;

-- Cria uma table no banco de dados para armazenar os agendamentos, com campos como id, criado_em, nome, whatsapp, email, negocio, plano, dia_preferido, horario, mensagem e status. Define restrições de integridade para cada campo.
-- Nenhuma policy de SELECT é criada para o público, de propósito:
-- os dados dos clientes ficam visíveis só para mim.

create index if not exists agendamentos_criado_em_idx on public.agendamentos (criado_em desc);
