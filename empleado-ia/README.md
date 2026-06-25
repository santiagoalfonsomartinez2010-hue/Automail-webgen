# Empleado IA - Atención al Cliente

Aplicación de empleado virtual de IA para atención al cliente. El empresario instala esto en su ordenador y tiene un "empleado" que lee emails, responde automáticamente, escala los casos difíciles y mantiene un dashboard con todo el trabajo del día.

## Arquitectura

```
Frontend (React + Vite)     →  localhost:3000
Backend (Node.js + Express) →  localhost:3001
Base de datos (SQLite)      →  ./backend/database.sqlite
Cerebro IA (Claude)         →  Anthropic API
Conocimiento (Google Sheets) → cada 30 minutos
Email (Gmail)               →  OAuth2 (Fase 2)
```

## Arrancar en desarrollo

### 1. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configurar variables de entorno

```bash
# En la carpeta empleado-ia/
cp .env.example .env
# Edita .env y añade tu ANTHROPIC_API_KEY
```

La única variable **obligatoria** para arrancar es `ANTHROPIC_API_KEY`.
El resto (Google Sheets, Gmail) son opcionales en fase de desarrollo.

### 3. Arrancar

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Abre **http://localhost:3000** en el navegador.

---

## Primera vez

El onboarding se abre automáticamente si no hay configuración.
Los 5 pasos te guían para configurar:

1. **Nombre y foto** de tu empleada IA
2. **Empresa y tono** de comunicación
3. **Google Sheets** con tu base de conocimiento
4. **Reglas de escalado** (qué casos no gestionar automáticamente)
5. **Gmail** (placeholder, se conecta en la siguiente fase)

### Modo simulación

Con `MODO_SIMULACION=true` en el `.env`, la app usa datos ficticios de
**Ferreterías López** para que puedas probar todo sin configurar servicios externos:
- 8 emails de ejemplo con clientes reales
- FAQs, productos y políticas pre-cargados
- Google Sheets simulado

---

## Estructura de Google Sheets

El Sheet debe tener estas pestañas exactas:

| Pestaña | Columnas |
|---------|----------|
| `FAQs` | Pregunta, Respuesta, Categoría |
| `Productos` | Nombre, Precio, Descripción |
| `Políticas` | Tema, Descripción |
| `Clientes_VIP` | Email, Nombre, Instrucciones_especiales |

---

## API del Backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/config` | Obtener configuración |
| POST | `/api/config` | Actualizar configuración |
| POST | `/api/config/foto` | Subir foto del empleado |
| GET | `/api/tickets/hoy` | Tickets del día |
| GET | `/api/clientes` | Lista de clientes |
| GET | `/api/stats` | Estadísticas del día |
| GET | `/api/conocimiento` | Caché de Google Sheets |
| POST | `/api/chat` | Chat con el empleado IA |
| POST | `/api/agente/procesar` | Forzar procesamiento de emails |
| POST | `/api/sheets/verificar` | Verificar conexión con Sheets |
| POST | `/api/sheets/sincronizar` | Sincronización manual |
| POST | `/api/onboarding/completar` | Completar el onboarding |

---

## Variables de entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `ANTHROPIC_API_KEY` | Clave de la API de Claude | **Sí** |
| `MODO_SIMULACION` | `true` para usar datos de prueba | No (defecto: true) |
| `GOOGLE_SHEET_ID` | ID del Google Sheet | No |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email de Service Account | No |
| `GOOGLE_PRIVATE_KEY` | Clave privada del Service Account | No |
| `GMAIL_CLIENT_ID` | OAuth2 Client ID de Gmail | No (Fase 2) |
| `GMAIL_CLIENT_SECRET` | OAuth2 Client Secret de Gmail | No (Fase 2) |
| `PORT` | Puerto del backend | No (defecto: 3001) |

---

## Roadmap

- [x] **Fase 1** — Núcleo (esta versión)
  - Dashboard completo con tickets, clientes y base de conocimiento
  - Agente IA con Claude para procesar emails
  - Chat en tiempo real con el empleado
  - Modo simulación con Ferreterías López
  - Onboarding de 5 pasos

- [ ] **Fase 2** — Gmail real
  - Conectar Gmail OAuth2
  - Leer emails reales y responder automáticamente
  - Loop de procesamiento cada 5 minutos

- [ ] **Fase 3** — Google Sheets real
  - Sincronización con Sheet real del cliente
  - Edición de FAQs desde el dashboard

- [ ] **Fase 4** — Mejoras
  - Análisis de satisfacción
  - Reportes semanales
  - Multi-empresa (SaaS)
