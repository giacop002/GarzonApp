-- Migración 001 · Tabla usuarios + trigger de alta automática
-- Correr en el SQL Editor del dashboard de Supabase.
-- (El RLS completo y el resto de tablas se definen en Fase 5.)

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null check (rol in ('dev', 'admin', 'garzon')),
  codigo_garzon char(2) unique,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: al crear un usuario en auth.users, crear su fila en usuarios
-- con rol 'garzon' por defecto.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre, rol)
  values (new.id, coalesce(new.email, 'Sin nombre'), 'garzon');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS básico para Fase 1: cada usuario lee su propia fila.
alter table public.usuarios enable row level security;

drop policy if exists "usuarios_select_propio" on public.usuarios;
create policy "usuarios_select_propio"
  on public.usuarios for select
  using (auth.uid() = id);
