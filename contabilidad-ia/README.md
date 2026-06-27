# Elena · Empleado de Contabilidad IA

Demo visual del **Empleado de Contabilidad IA** de la empresa ficticia
**Reformas Meridiano S.L.** (reformas en Madrid).

Es solo una demo de **frontend**: no hay backend ni base de datos.
Todos los datos (facturas, cobros, pagos, obras e informe) son
constantes simuladas dentro de `src/App.jsx`. El único servicio externo
es la **API de Anthropic**, que se llama directamente desde el navegador
para el chat con Elena.

## Tecnología

- React + Vite
- Recharts (gráficas del informe)
- lucide-react (iconos)
- Sin React Router · toda la UI vive en un único componente (`App.jsx`)

## Puesta en marcha

```bash
cd contabilidad-ia
npm install
cp .env.example .env   # y pega tu clave de Anthropic
npm run dev
```

Abre http://localhost:3000

## Variables de entorno

| Variable                    | Descripción                              |
| --------------------------- | ---------------------------------------- |
| `VITE_ANTHROPIC_API_KEY`    | Clave de la API de Anthropic para Elena  |

El chat usa el modelo `claude-sonnet-4-6` con `max_tokens: 1000`.

> ⚠️ La clave se lee desde el frontend (`import.meta.env`). Esto es
> aceptable para una **demo local**, pero no expongas una clave real en
> un despliegue público.

## Estructura de la pantalla

Layout fijo de 3 columnas sin scroll exterior:

1. **Sidebar** (240px) — perfil de Elena, estado y estadísticas del día y del mes.
2. **Panel central** (flexible) — 4 pestañas:
   - Facturas de hoy
   - Pagos y cobros
   - Informe de junio (gráficas con Recharts)
   - Obras activas (tarjetas expandibles con desglose financiero)
3. **Chat con Elena** (360px) — conversación en vivo con la API de Anthropic.
