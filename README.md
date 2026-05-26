# Agente IA ITSM Enterprise

Demo local en Next.js para presentar a SONDA un agente IA operacional de gestión ITSM basado en buenas prácticas ITIL.

La demo funciona sin credenciales reales, sin despliegue y sin servicios externos obligatorios. Todo corre en modo mock local, pero la arquitectura queda preparada para conectar Supabase, Mercury/Inception y un ITSM real.

## Correr localmente

```bash
npm install
npm run dev
```

Luego abrir `http://localhost:3000`.

Rutas principales:

- `/`: landing enterprise con arquitectura, KPIs y chat ITSM flotante.
- `/dashboard`: dashboard operativo con métricas, distribuciones y últimos tickets.
- `/api/chat`: motor conversacional mock con adapter LLM.
- `/api/tickets`: creación/listado de tickets simulados.
- `/api/knowledge`: base de conocimiento local.
- `/api/kpis`: KPIs demo.

## Arquitectura

Capas principales:

- `src/components`: UI reutilizable para landing, chat y dashboard.
- `src/lib/itsm`: tipos, clasificación, prioridad, campos requeridos y construcción de ticket.
- `src/lib/data`: knowledge base, KPIs y tickets demo.
- `src/lib/llm`: adapter Mercury/Inception con fallback mock.
- `src/lib/supabase`: clientes lazy que no fallan si faltan variables de entorno.
- `src/services`: repositorios desacoplados para tickets y chat.
- `src/app/api`: endpoints internos listos para reemplazar mocks por servicios reales.
- `supabase/schema.sql`: esquema sugerido para persistencia futura.

## Variables futuras

Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Mercury/Inception:

```env
MERCURY_API_KEY=
MERCURY_BASE_URL=
MERCURY_MODEL=
```

Si estas variables no existen, la demo usa mocks locales automáticamente.

## Conectar Supabase después

1. Crear proyecto Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Reemplazar o ampliar los repositorios en `src/services` si se requiere lógica de negocio adicional.
5. Mantener la inicialización lazy de clientes para evitar fallos durante build.

## Conectar Mercury/Inception después

1. Configurar `MERCURY_API_KEY`, `MERCURY_BASE_URL` y `MERCURY_MODEL`.
2. Ajustar `src/lib/llm/mercuryClient.ts` al contrato final de Mercury.
3. Mantener `generateITSMResponse(input)` como interfaz estable.
4. Usar el prompt rígido en `src/lib/llm/prompts/itsmSystemPrompt.ts`.
5. Validar que la respuesta siga el shape `ITSMResponse`.

## Conectar un ITSM real después

La demo está preparada para integrar ServiceNow, Jira Service Management, GLPI, Freshservice o Aranda mediante un repository/adapter adicional. La recomendación es mantener:

- Normalización del ticket en `TicketDraft`.
- Persistencia de eventos operativos en `ticket_events`.
- Registro de pasos ejecutados y criterios de escalamiento.
- Separación entre canal conversacional, decisión ITIL y creación en plataforma ITSM.

## Despliegue futuro en Vercel

No se despliega en esta primera pasada. Para un despliegue posterior:

1. Revisar variables de entorno.
2. Ejecutar `npm run build`.
3. Conectar el repositorio a Vercel.
4. Configurar variables en el proyecto.
5. Validar endpoints internos y modo mock/fallback antes de habilitar integraciones reales.

## Criterio de aceptación cubierto

- Landing profesional con marca, hero, arquitectura, valor y KPIs.
- Chat flotante enterprise con casos precargados.
- Flujo guiado con clasificación ITIL, prioridad, guía de descarte y ticket simulado.
- Base de conocimiento mock local.
- Supabase preparado y desacoplado.
- Mercury/Inception preparado con fallback mock.
- API routes internas funcionales.
- Dashboard operativo con métricas, distribuciones y tabla de tickets.
- Sin credenciales reales y sin dependencia externa obligatoria para correr localmente.
