# 👑 Don Ramón — El Rey de los Cueritos Rellenos (demo)

Sistema de pedidos para **Don Ramón · El Rey de los Cueritos Rellenos**,
catering cubano en 9351 SW 56 St, Miami FL 33165 (@elreydeloscueritosrellenos).

- App de clientes (`/`) — estilo negro/rojo/dorado como sus flyers,
  español, US$.
- Pantalla de tienda (`/tienda`) — fondo negro, protegida con `STORE_KEY`:
  pipeline pendiente_pago → nuevo → preparando → listo → entregado
  (el depósito de $50 por Zelle se confirma con "Pago recibido"),
  sonido de pedido nuevo, editor de catálogo/precios, Zelle configurable,
  pestaña Historial (filtros por fecha y estado, conteo de pedidos,
  total de ingresos, botón "Limpiar historial").

## Menú semilla

Extraído el 22-sep-2026 del flyer oficial de Instagram del negocio.
5 combos para 10 personas, precios confirmados: $100–$180.
Fotos reales enviadas por el dueño (`~/workspace/don-ramon-assets/`);
si llegan originales más limpios, reemplazar los archivos en
`public/images/` con el mismo nombre.

## Despliegue (Render)

1. Render → **New → Blueprint**
2. Conectar el repo `Papyboy1920/don-ramon-cueritos-pedidos`
3. **Apply** y esperar el despliegue
4. Copiar la clave generada de `STORE_KEY` (Render → Environment)
5. Pegarla en `/tienda`, configurar el Zelle en la pestaña Catálogo
   y hacer un pedido de prueba

## Demo local

```bash
npm install
STORE_KEY=prueba node server.js
# http://localhost:3000/        (clientes)
# http://localhost:3000/tienda  (tienda)
```

**Nota:** usa SQLite en disco efímero — solo para demo/arranque.
Un lanzamiento real necesita Postgres pago.
