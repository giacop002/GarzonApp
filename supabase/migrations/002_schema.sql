-- Migración 002 · Schema completo (Fase 5)
-- Tablas, funciones y triggers. Idempotente: se puede correr más de una vez.
-- Correr en el SQL Editor de Supabase DESPUÉS de 001_usuarios.sql.

-- ───────────────────────────────────────────────────────────
-- Función genérica de updated_at
-- ───────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────────────────────────────────────────
-- usuarios (creada en 001; aquí garantizamos existencia + updated_at)
-- ───────────────────────────────────────────────────────────
create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol text not null check (rol in ('dev','admin','garzon')),
  codigo_garzon char(2) unique,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_usuarios_updated_at on public.usuarios;
create trigger trg_usuarios_updated_at
  before update on public.usuarios
  for each row execute function public.handle_updated_at();

-- Helper para RLS: rol del usuario actual.
-- SECURITY DEFINER → evita recursión de RLS al leer usuarios desde sus políticas.
create or replace function public.get_mi_rol()
returns text language sql security definer stable set search_path = public as $$
  select rol from public.usuarios where id = auth.uid()
$$;

-- ───────────────────────────────────────────────────────────
-- zonas
-- ───────────────────────────────────────────────────────────
create table if not exists public.zonas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  orden smallint not null default 0
);

-- ───────────────────────────────────────────────────────────
-- mesas
-- ───────────────────────────────────────────────────────────
create table if not exists public.mesas (
  id uuid primary key default gen_random_uuid(),
  numero smallint not null unique,
  zona_id uuid not null references public.zonas(id),
  es_virtual boolean not null default false,
  mesa_real_id uuid references public.mesas(id),
  pos_x numeric(5,2) not null default 0,
  pos_y numeric(5,2) not null default 0,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  constraint chk_mesa_virtual check (es_virtual = true or mesa_real_id is null)
);
create index if not exists idx_mesas_zona_id on public.mesas(zona_id);
create index if not exists idx_mesas_es_virtual on public.mesas(es_virtual) where es_virtual = true;

-- ───────────────────────────────────────────────────────────
-- estados_mesa (una fila por mesa; candidata a Realtime en Fase 7)
-- ───────────────────────────────────────────────────────────
create table if not exists public.estados_mesa (
  mesa_id uuid primary key references public.mesas(id) on delete cascade,
  estado text not null default 'libre'
    check (estado in ('libre','ocupada','esperando_cierre','reservada')),
  garzon_id uuid references public.usuarios(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.usuarios(id)
);
create index if not exists idx_estados_mesa_estado on public.estados_mesa(estado);

-- Trigger: al crear una mesa, crear su estado inicial 'libre'.
create or replace function public.init_estado_mesa()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.estados_mesa (mesa_id, estado) values (new.id, 'libre')
  on conflict (mesa_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_init_estado_mesa on public.mesas;
create trigger trg_init_estado_mesa
  after insert on public.mesas
  for each row execute function public.init_estado_mesa();

-- ───────────────────────────────────────────────────────────
-- categorias_carta (árbol autorreferencial)
-- ───────────────────────────────────────────────────────────
create table if not exists public.categorias_carta (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  parent_id uuid references public.categorias_carta(id),
  orden smallint not null default 0,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_categorias_parent_id on public.categorias_carta(parent_id);

-- ───────────────────────────────────────────────────────────
-- items_carta
-- ───────────────────────────────────────────────────────────
create table if not exists public.items_carta (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  categoria_id uuid not null references public.categorias_carta(id),
  precio numeric(10,2) not null check (precio >= 0),
  foto_url text,
  disponible boolean not null default true,
  orden smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_items_categoria_id on public.items_carta(categoria_id);

drop trigger if exists trg_items_updated_at on public.items_carta;
create trigger trg_items_updated_at
  before update on public.items_carta
  for each row execute function public.handle_updated_at();

-- ───────────────────────────────────────────────────────────
-- disponibilidad_items
-- ───────────────────────────────────────────────────────────
create table if not exists public.disponibilidad_items (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items_carta(id) on delete cascade,
  disponible boolean not null,
  tipo text not null check (tipo in ('horario','temporada','manual')),
  hora_inicio time,
  hora_fin time,
  fecha_inicio date,
  fecha_fin date,
  motivo text,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.usuarios(id)
);
create index if not exists idx_disponibilidad_item_id on public.disponibilidad_items(item_id);

-- ───────────────────────────────────────────────────────────
-- pedidos
-- ───────────────────────────────────────────────────────────
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  mesa_id uuid not null references public.mesas(id),
  garzon_id uuid not null references public.usuarios(id),
  estado text not null default 'borrador'
    check (estado in ('borrador','enviado','cerrado','cancelado')),
  notas_generales text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cerrado_at timestamptz
);
create index if not exists idx_pedidos_mesa_id on public.pedidos(mesa_id);
create index if not exists idx_pedidos_garzon_id on public.pedidos(garzon_id);

drop trigger if exists trg_pedidos_updated_at on public.pedidos;
create trigger trg_pedidos_updated_at
  before update on public.pedidos
  for each row execute function public.handle_updated_at();

-- ───────────────────────────────────────────────────────────
-- pedido_items
-- ───────────────────────────────────────────────────────────
create table if not exists public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  item_id uuid not null references public.items_carta(id),
  cantidad smallint not null default 1 check (cantidad > 0),
  precio_unitario numeric(10,2) not null,
  notas text,
  created_at timestamptz not null default now()
);
create index if not exists idx_pedido_items_pedido_id on public.pedido_items(pedido_id);
