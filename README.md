# AUTOMAIL WebGen — Actor de Apify

Busca negocios sin web en Google Maps → genera landing pages profesionales con Claude → las publica en GitHub Pages → envía WhatsApp por Twilio.

---

## Estructura de archivos

```
src/
  main.js       ← Orquestador principal
  scraper.js    ← Llama al Actor de Google Maps
  claude.js     ← Genera el HTML con Claude API
  github.js     ← Publica en GitHub Pages
  twilio.js     ← Envía WhatsApp
.actor/
  actor.json    ← Config del Actor
  input_schema.json ← Formulario de inputs en Apify Console
Dockerfile
package.json
```

---

## Setup paso a paso

### 1. Crear repo de GitHub Pages

1. Ve a github.com → New repository
2. Nombre: `automail-webs` (o el que quieras)
3. Público ✅
4. Una vez creado: Settings → Pages → Source: **Deploy from branch → main → / (root)**
5. Tu URL base será: `https://TU_USUARIO.github.io/automail-webs/`

### 2. Crear GitHub Personal Access Token

1. github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Scope: **repo** (completo)
3. Guarda el token, solo se muestra una vez

### 3. Obtener tu Anthropic API Key

1. console.anthropic.com → API Keys → Create Key
2. Asegúrate de tener créditos (cada landing page ~$0.01-0.02)

### 4. Credenciales de Twilio WhatsApp

- Account SID y Auth Token: console.twilio.com → Dashboard
- Para el sandbox: `From = whatsapp:+14155238886`
- OJO: En sandbox, el destinatario debe haber enviado primero "join <código>" al número de Twilio

### 5. Subir el Actor a Apify

**Opción A — Web IDE (más fácil):**
1. apify.com → Actors → Create new Actor
2. Elige "Empty JavaScript template"
3. Copia cada archivo en el Web IDE
4. Click en "Build" → "Start"

**Opción B — Apify CLI (si tienes Node instalado):**
```bash
npm install -g apify-cli
apify login
apify push
```

---

## Inputs del Actor

| Campo | Descripción | Ejemplo |
|---|---|---|
| ciudad | Ciudad donde buscar | Madrid |
| categoria | Tipo de negocio | clinica fisioterapia |
| cantidad | Nº de negocios (max 50) | 10 |
| anthropicKey | API Key de Anthropic | sk-ant-... |
| githubToken | Token de GitHub | ghp_... |
| githubUser | Tu usuario de GitHub | santi |
| githubRepo | Repo con Pages activo | automail-webs |
| twilioSid | Account SID Twilio | AC... |
| twilioToken | Auth Token Twilio | ... |
| twilioFrom | Número WhatsApp Twilio | whatsapp:+14155238886 |

---

## Output

El Actor guarda en el Dataset de Apify una fila por negocio:

```json
{
  "name": "Clínica Fisio Madrid Centro",
  "phone": "+34912345678",
  "address": "Calle Gran Vía 12, Madrid",
  "category": "clinica fisioterapia",
  "pageUrl": "https://santi.github.io/automail-webs/clinica-fisio-madrid-centro/",
  "whatsappStatus": "sent:SM123abc...",
  "status": "completado",
  "timestamp": "2026-06-10T10:23:00.000Z"
}
```

---

## Costes estimados por ejecución (10 negocios)

| Servicio | Coste |
|---|---|
| Apify (compute units) | ~$0.05 |
| Claude API (10 páginas) | ~$0.10-0.20 |
| Twilio WhatsApp | ~$0.05 |
| GitHub Pages | Gratis |
| **TOTAL** | **~$0.20-0.30** |

---

## Programar ejecución automática

En Apify Console → tu Actor → Schedules → Add schedule:
- Cron: `0 9 * * 1` (cada lunes a las 9am)
- Cambia `ciudad` y `categoria` cada semana para no repetir leads
