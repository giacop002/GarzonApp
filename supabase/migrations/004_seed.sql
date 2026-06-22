-- Migración 004 · Seed de datos (Fase 5)
-- Carga zonas, mesas (con posiciones en grilla) y la carta real (docs/CARTA.txt).
-- Solo siembra si las tablas están vacías (idempotente a nivel de "primera carga").
-- Correr DESPUÉS de 002_schema.sql y 003_rls.sql.
--
-- Nota de modelado: donde el menú mezcla ítems sueltos con subcategorías en un
-- mismo nivel, se crean subcategorías contenedoras (Aguas y Energéticas,
-- Porciones, Otras Tablas) porque la app muestra, por nivel, o categorías o ítems.

do $$
declare
  z_ext uuid;
  z_int uuid;
  -- raíces
  l uuid; aco uuid; pla uuid; des uuid; pos uuid;
  -- Líquidos
  fri uuid; cal uuid;
  jug uuid; lim uuid; beb uuid; milk uuid; bar uuid; agen uuid;
  ape uuid; coc uuid; cer uuid;
  sg uuid; sxl uuid; sina uuid;
  -- Acompañamientos
  pic uuid; tab uuid; por uuid;
  tit uuid; otab uuid;
  -- Platos
  syh uuid; pas uuid; ens uuid; car uuid; nin uuid; com uuid;
  san uuid; ham uuid;
begin
  -- ── ZONAS + MESAS ──────────────────────────────────────────
  if (select count(*) from public.zonas) = 0 then
    insert into public.zonas (nombre, descripcion, orden)
      values ('Exterior', 'Terraza y vereda', 0) returning id into z_ext;
    insert into public.zonas (nombre, descripcion, orden)
      values ('Interior', 'Salón principal', 1) returning id into z_int;

    -- Exterior (numero, col, fila) — grilla 4x11 según docs/DIST_MESAS.txt
    insert into public.mesas (numero, zona_id, pos_x, pos_y)
    select v.numero, z_ext,
           round((8 + 84.0 * (v.col + 0.5) / 4)::numeric, 2),
           round((8 + 84.0 * (v.fila + 0.5) / 11)::numeric, 2)
    from (values
      (16,0,0),(15,1,0),(14,2,0),(1,3,0),
      (17,0,1),(12,1,1),(13,2,1),(2,3,1),
      (18,0,2),(11,1,2),(10,2,2),(3,3,2),
      (8,1,3),(9,2,3),(4,3,3),
      (7,1,4),(6,2,4),(5,3,4),
      (29,1,6),(30,2,6),(31,3,6),
      (19,0,7),(28,1,7),(27,2,7),(32,3,7),
      (20,0,8),(26,1,8),(25,2,8),(33,3,8),
      (21,0,9),(23,1,9),(24,2,9),(34,3,9),
      (22,0,10),(37,1,10),(36,2,10),(35,3,10)
    ) as v(numero, col, fila);

    -- Interior (numero, col, fila) — grilla 5x9. 68 y 69 son mesas reales.
    insert into public.mesas (numero, zona_id, pos_x, pos_y)
    select v.numero, z_int,
           round((8 + 84.0 * (v.col + 0.5) / 5)::numeric, 2),
           round((8 + 84.0 * (v.fila + 0.5) / 9)::numeric, 2)
    from (values
      (42,0,0),(69,1,0),(43,2,0),(44,3,0),(45,4,0),
      (41,0,1),(47,2,1),(46,3,1),
      (40,0,2),(68,1,2),(48,2,2),(49,3,2),(50,4,2),
      (57,1,3),(52,2,3),(51,3,3),
      (56,1,4),
      (55,1,5),(54,2,5),(53,3,5),
      (58,1,6),(63,2,6),(64,3,6),(67,4,6),
      (59,0,7),(62,1,7),(65,2,7),(66,3,7),
      (60,0,8),(61,1,8)
    ) as v(numero, col, fila);

    -- Virtuales: 70..75 (parche del sistema actual, sin posición en el mapa).
    insert into public.mesas (numero, zona_id, es_virtual)
    select g, z_int, true from generate_series(70, 75) as g;
  end if;

  -- ── CARTA ──────────────────────────────────────────────────
  if (select count(*) from public.categorias_carta) = 0 then
    -- Raíces
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Líquidos', null, 0) returning id into l;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Acompañamientos', null, 1) returning id into aco;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Platos', null, 2) returning id into pla;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Desayunos', null, 3) returning id into des;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Postres', null, 4) returning id into pos;

    -- Líquidos
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Fríos', l, 0) returning id into fri;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Calientes', l, 1) returning id into cal;

    -- Fríos
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Jugos', fri, 0) returning id into jug;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Limonadas', fri, 1) returning id into lim;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Bebidas', fri, 2) returning id into beb;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Milkshakes', fri, 3) returning id into milk;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Barra', fri, 4) returning id into bar;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Aguas y Energéticas', fri, 5) returning id into agen;

    -- Barra
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Aperitivos', bar, 0) returning id into ape;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Cocktails', bar, 1) returning id into coc;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Cervezas', bar, 2) returning id into cer;

    -- Cervezas
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Schop Grande (500cc)', cer, 0) returning id into sg;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Schop XL (700cc)', cer, 1) returning id into sxl;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Sin Alcohol (330cc)', cer, 2) returning id into sina;

    -- Acompañamientos
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Picoteos', aco, 0) returning id into pic;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Tablas', aco, 1) returning id into tab;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Porciones', aco, 2) returning id into por;

    -- Tablas
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Titánicas', tab, 0) returning id into tit;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Otras Tablas', tab, 1) returning id into otab;

    -- Platos
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Sándwiches & Hamburguesas', pla, 0) returning id into syh;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Pastas', pla, 1) returning id into pas;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Ensaladas', pla, 2) returning id into ens;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Carnes, Pollo & Costillas', pla, 3) returning id into car;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Menú de Niños', pla, 4) returning id into nin;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Completos', pla, 5) returning id into com;

    -- Sándwiches & Hamburguesas
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Sándwiches', syh, 0) returning id into san;
    insert into public.categorias_carta (nombre, parent_id, orden) values ('Hamburguesas', syh, 1) returning id into ham;

    -- ── ÍTEMS ────────────────────────────────────────────────
    insert into public.items_carta (nombre, descripcion, categoria_id, precio, disponible, orden) values
    -- Jugos (450cc)
    ('Frutilla', 'Jugo 450cc', jug, 4290, true, 0),
    ('Piña', 'Jugo 450cc', jug, 4290, true, 1),
    ('Mango', 'Jugo 450cc', jug, 4290, true, 2),
    ('Piña-Mango', 'Jugo 450cc', jug, 4290, true, 3),
    ('Mango-Maracuyá', 'Jugo 450cc', jug, 4290, true, 4),
    ('Frutilla-Piña', 'Jugo 450cc', jug, 4290, true, 5),
    -- Limonadas (450cc)
    ('Limón', 'Limonada 450cc', lim, 4290, true, 0),
    ('Limón Menta', 'Limonada 450cc', lim, 4290, true, 1),
    ('Menta Jengibre', 'Limonada 450cc', lim, 4290, true, 2),
    ('Frutilla', 'Limonada 450cc', lim, 4290, true, 3),
    -- Bebidas (450cc)
    ('Pepsi', '450cc', beb, 2990, true, 0),
    ('Pepsi Zero', '450cc', beb, 2990, true, 1),
    ('Crush', '450cc', beb, 2990, true, 2),
    ('7up', '450cc', beb, 2990, true, 3),
    ('Bilz', '450cc', beb, 2990, true, 4),
    ('Kem Piña', '450cc', beb, 2990, true, 5),
    -- Milkshakes
    ('Vainilla', 'Helado, leche y crema.', milk, 4990, true, 0),
    ('Frutilla', 'Helado, leche y crema.', milk, 4990, true, 1),
    ('Chocolate', 'Helado, leche y crema.', milk, 4990, true, 2),
    -- Aguas y Energéticas
    ('Agua Mineral', '600cc', agen, 1990, true, 0),
    ('Red Bull', 'Energética 250cc', agen, 3000, true, 1),
    -- Calientes
    ('Café Express Simple', null, cal, 2690, true, 0),
    ('Café Express Doble', null, cal, 3690, true, 1),
    ('Cortado Clásico', null, cal, 2790, true, 2),
    ('Nescafé', null, cal, 2490, true, 3),
    ('Té Dilmah', null, cal, 2490, true, 4),
    -- Aperitivos
    ('Pisco Sour', 'Happy hour $2.990 hasta las 17:00.', ape, 3990, true, 0),
    ('Piscola', null, ape, 3990, true, 1),
    ('Vaina', null, ape, 3990, true, 2),
    ('Vermut', null, ape, 3990, true, 3),
    ('Campari Naranja', null, ape, 3990, true, 4),
    ('Pisco Sour Mango', null, ape, 4290, true, 5),
    -- Cocktails
    ('Moscow Mule', null, coc, 5990, false, 0),
    ('Mojito', null, coc, 4990, true, 1),
    ('Caipirinha', null, coc, 4990, true, 2),
    ('Daiquiri', null, coc, 4990, true, 3),
    ('Margarita', null, coc, 4990, true, 4),
    ('Piña Colada', null, coc, 4990, true, 5),
    ('Tequila Sunrise', null, coc, 4990, true, 6),
    ('Mojito Sol XL', null, coc, 6990, true, 7),
    -- Schop Grande (500cc) — opción chela/michelar +$1.000
    ('Escudo', 'Opción chela/michelar por $1.000.', sg, 4290, true, 0),
    ('Royal Guard', 'Opción chela/michelar por $1.000.', sg, 4790, true, 1),
    ('Heineken', 'Opción chela/michelar por $1.000.', sg, 4790, true, 2),
    ('Kuntsmann Torobayo', 'Opción chela/michelar por $1.000.', sg, 5290, true, 3),
    ('Austral Calafate', 'Opción chela/michelar por $1.000.', sg, 5290, true, 4),
    -- Schop XL (700cc)
    ('Escudo', 'Opción chela/michelar por $1.000.', sxl, 5290, true, 0),
    ('Royal Guard', 'Opción chela/michelar por $1.000.', sxl, 6290, true, 1),
    ('Heineken', 'Opción chela/michelar por $1.000.', sxl, 6290, true, 2),
    ('Kuntsmann Torobayo', 'Opción chela/michelar por $1.000.', sxl, 7290, true, 3),
    ('Austral Calafate', 'Opción chela/michelar por $1.000.', sxl, 7290, true, 4),
    -- Sin Alcohol (330cc)
    ('Heineken', 'Botella 330cc', sina, 3990, true, 0),
    ('Kuntsmann', 'Botella 330cc', sina, 4990, true, 1),
    -- Picoteos
    ('Quesadilla de Pollo', 'Quesadilla rellena de jugosa pechuga de pollo, queso fundido, choclo, pimentón, tomate y cebolla salteada.', pic, 8990, true, 0),
    ('Quesadilla de Carne', 'Quesadilla rellena con sabrosa carne y queso fundido.', pic, 10990, true, 1),
    ('Papas Gringas', 'Papas fritas con crocante tocino y salsa de queso cheddar.', pic, 10990, true, 2),
    ('Picoteo Clásico', 'Empanaditas de queso, papas fritas, filetes de pollo apanados y salsa barbecue.', pic, 14990, true, 3),
    ('Picoteo Gran Máster', 'Papas fritas, alitas barbecue, empanaditas de queso, pollo crocante, aros de cebolla y nachos con salsa barbecue.', pic, 14990, true, 4),
    ('Picoteo Camarones', 'Camarones apanados, aros de papa con cebolla salteada y mayonesa de la casa.', pic, 12990, false, 5),
    ('Papas Mechada Cheddar', 'Papas fritas con carne mechada, salsa de queso cheddar y un toque de cebollín.', pic, 14990, true, 6),
    -- Titánicas
    ('Titánica Carnívora', 'Papas fritas con cortes de vacuno, cerdo y pollo, cebolla caramelizada, pimentón y cebollín, chorizo, huevos, tocino, 3 salsas y nachos.', tit, 22990, true, 0),
    ('Titánica Pollo Champiñón', 'Papas fritas con pollo a la plancha, champiñones salteados, crema, cebollín, 3 salsas y nachos.', tit, 19990, true, 1),
    ('Titánica Carne Champiñón', 'Papas fritas con carne, champiñones salteados, crema, cebollín, 3 salsas y nachos.', tit, 21990, true, 2),
    ('Titánica Clásica', 'Papas fritas con carne mechada, chorizo, vienesas, huevos, pimentón y cebollín, cebolla caramelizada, 3 salsas y nachos.', tit, 21990, true, 3),
    ('Titánica Mechada Cheddar', 'Papas fritas con carne mechada, salsa cheddar, cebollín y nachos.', tit, 21990, true, 4),
    -- Otras Tablas
    ('Tabla Brochetas', 'Brochetas de pollo, camarones, cerdo, quesadilla de pollo, choclo, pimentón, tomate, cebolla y queso, mozzarella stick y salsa de la casa.', otab, 18990, false, 0),
    ('Quesadillas Mixtas', 'Quesadillas de carne con queso y de pollo con choclo, pimentón, tomate, cebolla y queso, con dos salsas.', otab, 17990, true, 1),
    ('Tabla La Crujiente', 'Pollo apanado, aros de papa con cebolla, mozzarella stick y mayonesa de la casa.', otab, 14990, true, 2),
    ('Tabla Camarones', 'Camarones y pollo apanados con papas fritas y mayo con merkén.', otab, 14990, false, 3),
    -- Porciones
    ('3 empanaditas de queso', 'Disponible hasta las 17:00.', por, 1990, true, 0),
    ('6 empanaditas de queso', 'Todo el día.', por, 3890, true, 1),
    ('Papas fritas', null, por, 3990, true, 2),
    ('3 supremitas de pollo', null, por, 2990, true, 3),
    ('3 mozzarella stick', null, por, 2990, true, 4),
    -- Sándwiches
    ('Pollo Gringo', 'Pollo apanado, queso cheddar, tocino, aros de cebolla fritos, salsa barbecue y cebolla caramelizada.', san, 9990, false, 0),
    ('Barros Luco', 'Jugosa carne con queso fundido.', san, 10990, true, 1),
    ('Pollo Crunch', 'Pollo apanado, queso, tomate, palta natural y mayonesa de la casa.', san, 9990, true, 2),
    ('Churrasco Italiano', 'Cortes de carne con palta, tomate y mayonesa de la casa.', san, 10990, true, 3),
    ('Chacarero', 'Jugosa carne, tomate, mayonesa, porotos verdes y ají.', san, 10990, true, 4),
    ('Mechada Queso', 'Carne mechada con queso fundido en pan amasado.', san, 10990, true, 5),
    -- Hamburguesas
    ('Queso Tocino', 'Carne con queso cheddar y crocante tocino. Opción NotCo.', ham, 10990, true, 0),
    ('La Gringa', 'Lechuga, queso cheddar, pepinillo, tomate, kétchup, cebolla caramelizada, pan brioche y papas fritas. Opción NotCo.', ham, 10990, true, 1),
    ('Gran George', 'Tocino, queso, aros de cebolla, salsa barbecue y lechuga. Opción NotCo.', ham, 10990, true, 2),
    ('Italiana', 'Palta natural, tomate y mayonesa. Opción NotCo.', ham, 9990, true, 3),
    ('La Pecadora', 'Queso cheddar, tocino, cebolla caramelizada, salsa barbecue y mayo merkén.', ham, 10990, true, 4),
    -- Pastas
    ('Tallarines con Lomo Saltado', 'Cortes de lomo salteados con cebollín, tomate, cebolla morada y salsa de soya al estilo peruano.', pas, 11990, true, 0),
    ('Tallarines con Pollo Saltado', 'Pollo salteado con salsa de soya, cebolla morada, tomate y cebollín, al estilo peruano.', pas, 9990, true, 1),
    ('Spaghetti en Crema de Camarones', 'Camarones salteados con un toque de ajo.', pas, 9990, true, 2),
    ('Lasaña Boloñesa', 'Salsa boloñesa, crema y queso fundido con parmesano artesanal.', pas, 9990, true, 3),
    ('Spaghetti con Camarones y Pesto', 'Salsa de pesto, camarones salteados y parmesano.', pas, 9990, true, 4),
    ('Spaghetti Pollo Tocino', 'Salsa blanca con ajo, pechuga de pollo, tocino y parmesano.', pas, 8990, true, 5),
    ('Lasaña Pollo Champiñón Pesto', 'Crema de champiñones, pollo, pesto y parmesano.', pas, 10990, true, 6),
    -- Ensaladas
    ('Ensalada Pollo Teriyaki', 'Pollo en salsa teriyaki sobre mix de lechugas, palta, tomate, pimentón, cebollín y coleslaw.', ens, 9990, true, 0),
    ('Ensalada Cobb', 'Mix de lechugas, pollo, tocino, palta, huevo, tomate y parmesano.', ens, 9990, true, 1),
    ('Ensalada Carnívora', 'Cortes de carne, palta, lechuga, porotos negros, choclo, pimentón y zanahoria con salsa de la casa.', ens, 10990, true, 2),
    ('Ensalada César Pollo', 'Lechuga, pollo, parmesano, salsa césar y crutones.', ens, 9990, true, 3),
    ('Ensalada Pollo Crocante', 'Pollo empanizado, mix de lechugas, tomate, cebolla, choclo, cilantro y vinagreta.', ens, 9990, true, 4),
    ('Ensalada Dos Carnes', 'Lechuga, pollo, pimentón, palmitos, choclo y parmesano.', ens, 10990, true, 5),
    ('Palta Reina', 'Lechuga, paltas rellenas de ave-mayo, choclo, zanahoria, tomate, palmito y arroz.', ens, 9990, true, 6),
    -- Carnes, Pollo & Costillas (platos con arroz desde las 11:00)
    ('Lomo Saltado', 'Tiras de lomo al estilo peruano con arroz y papas fritas.', car, 12990, true, 0),
    ('Lomo en Crema de Champiñones', 'Bistec de lomo liso en salsa de champiñones, papas doradas y arroz.', car, 11990, true, 1),
    ('Bistec de Lomo a lo Pobre', 'Bistec de lomo con papas fritas, cebolla caramelizada, dos huevos fritos y pan de ajo.', car, 12990, true, 2),
    ('Carne Mechada', 'Cocción lenta con salsa de tomate y vino tinto, arroz y papas doradas.', car, 10990, true, 3),
    ('Carne a la Mongoliana', 'Carne salteada con cebollín y salsa de soya, arroz y papas doradas.', car, 9990, true, 4),
    ('Mechada con Spaghetti', 'Carne mechada sobre spaghetti con salsa napolitana y parmesano.', car, 9990, true, 5),
    ('Bistec de Lomo Mediterráneo', 'Bistec de lomo con arroz y ensalada mixta.', car, 10990, true, 6),
    ('Costilla a lo Pobre', 'Costilla barbecue con papas fritas, huevos fritos y cebolla caramelizada.', car, 14990, true, 7),
    ('Pollo Mediterráneo', 'Pechuga de pollo con arroz y ensalada mixta.', car, 8990, true, 8),
    ('Pollo en Crema de Champiñones', 'Pechuga a la plancha en salsa de champiñones, arroz y papas doradas.', car, 9990, true, 9),
    ('Pollo en Crema de Camarones', 'Pollo con salsa de camarones, papas doradas y arroz.', car, 10990, true, 10),
    ('Pollo Saltado', 'Pollo salteado con cebolla morada, cebollín y tomate, arroz y papas fritas.', car, 9990, true, 11),
    ('Milanesa de Pollo a lo Pobre', 'Milanesa de pollo con papas fritas, huevos y cebolla frita.', car, 10990, true, 12),
    -- Menú de Niños
    ('Nuggets de Pollo', 'Con papas fritas y arroz.', nin, 6990, true, 0),
    ('Hamburguesa de Queso', 'Con papas fritas.', nin, 6990, true, 1),
    -- Completos
    ('Completo Italiano', null, com, 5990, false, 0),
    ('Completo Chacarero', null, com, 5990, false, 1),
    -- Desayunos (hasta las 11:00)
    ('Paila de Huevo con Palta + Té', 'Disponible hasta las 11:00.', des, 3990, true, 0),
    ('Paila de Huevo con Palta + Café', 'Disponible hasta las 11:00.', des, 3990, true, 1),
    ('Paila de Huevo con Tocino + Té', 'Disponible hasta las 11:00.', des, 3990, true, 2),
    ('Paila de Huevo con Tocino + Café', 'Disponible hasta las 11:00.', des, 3990, true, 3),
    ('Barros Luco + Té', 'Disponible hasta las 11:00.', des, 4990, true, 4),
    ('Barros Luco + Café', 'Disponible hasta las 11:00.', des, 4990, true, 5),
    -- Postres
    ('Panqueques con Manjar y Helado (promo)', 'Promoción hasta las 17:00.', pos, 2990, true, 0),
    ('Tiramisú', 'Postre frío italiano con queso cremoso y café.', pos, 4990, true, 1),
    ('Panqueque con Manjar y Helado', 'Panqueque relleno con manjar y helado de vainilla.', pos, 4990, true, 2),
    ('Café Helado', 'Café con helado y crema.', pos, 4990, true, 3),
    ('Panqueques Nutella', 'Dos panqueques rellenos de Nutella, helado y salsa de caramelo.', pos, 5990, true, 4),
    ('Copa de Helado', 'Helado de vainilla, chocolate y frutos rojos con crema.', pos, 6990, true, 5);
  end if;
end $$;
