-- Migración 003 · Row Level Security (Fase 5)
-- Idempotente: hace drop policy if exists antes de crear.
-- Correr DESPUÉS de 002_schema.sql.
-- Usa public.get_mi_rol() (definida en 002) para evaluar el rol.

-- ───────────────────────────────────────────────────────────
-- usuarios
-- ───────────────────────────────────────────────────────────
alter table public.usuarios enable row level security;

drop policy if exists "usuarios_select_propio" on public.usuarios;
drop policy if exists "usuarios_select" on public.usuarios;
create policy "usuarios_select" on public.usuarios for select
  using (id = auth.uid() or public.get_mi_rol() in ('admin','dev'));

drop policy if exists "usuarios_update" on public.usuarios;
create policy "usuarios_update" on public.usuarios for update
  using (id = auth.uid() or public.get_mi_rol() in ('admin','dev'));

drop policy if exists "usuarios_delete" on public.usuarios;
create policy "usuarios_delete" on public.usuarios for delete
  using (public.get_mi_rol() = 'dev');
-- INSERT: solo vía trigger handle_new_user (SECURITY DEFINER). Sin policy de insert.

-- ───────────────────────────────────────────────────────────
-- zonas (solo dev gestiona; todos leen)
-- ───────────────────────────────────────────────────────────
alter table public.zonas enable row level security;

drop policy if exists "zonas_select" on public.zonas;
create policy "zonas_select" on public.zonas for select
  using (auth.uid() is not null);

drop policy if exists "zonas_write" on public.zonas;
create policy "zonas_write" on public.zonas for all
  using (public.get_mi_rol() = 'dev')
  with check (public.get_mi_rol() = 'dev');

-- ───────────────────────────────────────────────────────────
-- mesas (admin/dev gestionan; todos leen; delete solo dev)
-- ───────────────────────────────────────────────────────────
alter table public.mesas enable row level security;

drop policy if exists "mesas_select" on public.mesas;
create policy "mesas_select" on public.mesas for select
  using (auth.uid() is not null);

drop policy if exists "mesas_insert" on public.mesas;
create policy "mesas_insert" on public.mesas for insert
  with check (public.get_mi_rol() in ('admin','dev'));

drop policy if exists "mesas_update" on public.mesas;
create policy "mesas_update" on public.mesas for update
  using (public.get_mi_rol() in ('admin','dev'));

drop policy if exists "mesas_delete" on public.mesas;
create policy "mesas_delete" on public.mesas for delete
  using (public.get_mi_rol() = 'dev');

-- ───────────────────────────────────────────────────────────
-- estados_mesa
-- ───────────────────────────────────────────────────────────
alter table public.estados_mesa enable row level security;

drop policy if exists "estados_mesa_select" on public.estados_mesa;
create policy "estados_mesa_select" on public.estados_mesa for select
  using (auth.uid() is not null);

-- Garzón: solo si la mesa está libre (garzon_id null) o ya es suya.
-- Admin/dev: sin restricción.
drop policy if exists "estados_mesa_update" on public.estados_mesa;
create policy "estados_mesa_update" on public.estados_mesa for update
  using (
    public.get_mi_rol() in ('admin','dev')
    or garzon_id is null
    or garzon_id = auth.uid()
  );
-- INSERT: solo vía trigger init_estado_mesa (SECURITY DEFINER).

-- ───────────────────────────────────────────────────────────
-- categorias_carta / items_carta / disponibilidad_items
-- Todos leen; admin/dev gestionan.
-- ───────────────────────────────────────────────────────────
alter table public.categorias_carta enable row level security;

drop policy if exists "categorias_select" on public.categorias_carta;
create policy "categorias_select" on public.categorias_carta for select
  using (auth.uid() is not null);

drop policy if exists "categorias_write" on public.categorias_carta;
create policy "categorias_write" on public.categorias_carta for all
  using (public.get_mi_rol() in ('admin','dev'))
  with check (public.get_mi_rol() in ('admin','dev'));

alter table public.items_carta enable row level security;

drop policy if exists "items_select" on public.items_carta;
create policy "items_select" on public.items_carta for select
  using (auth.uid() is not null);

drop policy if exists "items_write" on public.items_carta;
create policy "items_write" on public.items_carta for all
  using (public.get_mi_rol() in ('admin','dev'))
  with check (public.get_mi_rol() in ('admin','dev'));

alter table public.disponibilidad_items enable row level security;

drop policy if exists "disponibilidad_select" on public.disponibilidad_items;
create policy "disponibilidad_select" on public.disponibilidad_items for select
  using (auth.uid() is not null);

drop policy if exists "disponibilidad_write" on public.disponibilidad_items;
create policy "disponibilidad_write" on public.disponibilidad_items for all
  using (public.get_mi_rol() in ('admin','dev'))
  with check (public.get_mi_rol() in ('admin','dev'));

-- ───────────────────────────────────────────────────────────
-- pedidos
-- ───────────────────────────────────────────────────────────
alter table public.pedidos enable row level security;

drop policy if exists "pedidos_select" on public.pedidos;
create policy "pedidos_select" on public.pedidos for select
  using (garzon_id = auth.uid() or public.get_mi_rol() in ('admin','dev'));

drop policy if exists "pedidos_insert" on public.pedidos;
create policy "pedidos_insert" on public.pedidos for insert
  with check (
    garzon_id = auth.uid()
    or public.get_mi_rol() in ('admin','dev')
  );

drop policy if exists "pedidos_update" on public.pedidos;
create policy "pedidos_update" on public.pedidos for update
  using (
    public.get_mi_rol() in ('admin','dev')
    or (garzon_id = auth.uid())
  );

drop policy if exists "pedidos_delete" on public.pedidos;
create policy "pedidos_delete" on public.pedidos for delete
  using (public.get_mi_rol() = 'dev');

-- ───────────────────────────────────────────────────────────
-- pedido_items (hereda permisos del pedido padre)
-- ───────────────────────────────────────────────────────────
alter table public.pedido_items enable row level security;

drop policy if exists "pedido_items_select" on public.pedido_items;
create policy "pedido_items_select" on public.pedido_items for select
  using (exists (
    select 1 from public.pedidos p
    where p.id = pedido_id
      and (p.garzon_id = auth.uid() or public.get_mi_rol() in ('admin','dev'))
  ));

drop policy if exists "pedido_items_write" on public.pedido_items;
create policy "pedido_items_write" on public.pedido_items for all
  using (exists (
    select 1 from public.pedidos p
    where p.id = pedido_id
      and (p.garzon_id = auth.uid() or public.get_mi_rol() in ('admin','dev'))
  ))
  with check (exists (
    select 1 from public.pedidos p
    where p.id = pedido_id
      and (p.garzon_id = auth.uid() or public.get_mi_rol() in ('admin','dev'))
  ));
