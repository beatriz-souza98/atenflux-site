-- Banco de dados da Atenflux (Supabase)

create table if not exists public.agendamentos (
  id              bigint generated always as identity primary key,
  criado_em       timestamptz not null default now(),
  nome            text        not null check (char_length(nome) between 1 and 120),
  whatsapp        text        not null check (char_length(whatsapp) between 8 and 30),
  email           text        check (email is null or char_length(email) <= 200),
  negocio         text        check (negocio is null or char_length(negocio) <= 200),
  plano           text        not null check (plano in ('Ainda não sei', 'Chatbot', 'Chatbot + Site', 'Completo')),
  data_preferida  date        not null,
  horario         text        not null check (char_length(horario) <= 10),
  mensagem        text        check (mensagem is null or char_length(mensagem) <= 2000),
  status          text        not null default 'novo' check (status in ('novo', 'contatado', 'agendado', 'fechado', 'descartado'))
);

-- Segurança: ativa as regras por linha (RLS).
alter table public.agendamentos enable row level security;

drop policy if exists "site pode inserir pedidos" on public.agendamentos;
create policy "site pode inserir pedidos"
  on public.agendamentos
  for insert
  to anon
  with check (status = 'novo');

create index if not exists agendamentos_criado_em_idx on public.agendamentos (criado_em desc);
