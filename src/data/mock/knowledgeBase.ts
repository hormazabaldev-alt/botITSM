import type { ITSMIntent, KnowledgeArticle } from "@/lib/itsm/types";

export const knowledgeBase: KnowledgeArticle[] = [
  {
    id: "kb-password-mail",
    title: "Reset y validación de acceso a correo corporativo",
    category: "Identidad y productividad",
    intent: "ACCESS_REQUEST",
    symptoms: ["No puede acceder a correo", "Clave expirada", "MFA bloqueado"],
    resolutionSteps: [
      "Validar si el usuario puede ingresar al portal de identidad corporativa.",
      "Confirmar que el segundo factor de autenticación esté disponible.",
      "Solicitar reset de contraseña desde el flujo autorizado de autoservicio.",
      "Cerrar sesiones antiguas y reintentar acceso al correo.",
    ],
    escalationCriteria: [
      "El usuario no supera MFA luego de validación.",
      "La cuenta aparece bloqueada o deshabilitada.",
      "Hay sospecha de acceso no autorizado.",
    ],
    tags: ["correo", "password", "clave", "mfa", "outlook", "login"],
  },
  {
    id: "kb-vpn-validation",
    title: "Validación de conectividad VPN",
    category: "Conectividad segura",
    intent: "NETWORK_ISSUE",
    symptoms: ["VPN no conecta", "Timeout", "Credenciales rechazadas", "Sin acceso remoto"],
    resolutionSteps: [
      "Confirmar conexión a internet estable fuera de la VPN.",
      "Validar que la fecha y hora del equipo estén sincronizadas.",
      "Reiniciar el cliente VPN y autenticar nuevamente.",
      "Probar conexión desde otra red permitida.",
      "Registrar código de error visible si el fallo persiste.",
    ],
    escalationCriteria: [
      "El error afecta a múltiples usuarios.",
      "Hay indisponibilidad del concentrador VPN.",
      "El usuario tiene urgencia operativa alta y no existe workaround.",
    ],
    tags: ["vpn", "red", "remote", "conectividad", "teletrabajo"],
  },
  {
    id: "kb-authorized-software",
    title: "Instalación de software autorizado",
    category: "Gestión de requerimientos",
    intent: "SOFTWARE_REQUEST",
    symptoms: ["Necesita instalar software", "Aplicación no disponible", "Solicitud de licencia"],
    resolutionSteps: [
      "Verificar que el software esté en el catálogo autorizado.",
      "Confirmar aprobación del responsable del área si requiere licencia.",
      "Validar compatibilidad con el equipo y sistema operativo.",
      "Registrar requerimiento con justificación de negocio.",
    ],
    escalationCriteria: [
      "Software no catalogado.",
      "Requiere compra o asignación de licencia.",
      "Implica permisos administrativos o excepción de seguridad.",
    ],
    tags: ["software", "instalar", "licencia", "catálogo", "aplicación"],
  },
  {
    id: "kb-slow-notebook",
    title: "Diagnóstico básico de notebook lento",
    category: "Puesto de trabajo",
    intent: "HARDWARE_ISSUE",
    symptoms: ["Equipo lento", "Arranque demorado", "Aplicaciones congeladas"],
    resolutionSteps: [
      "Reiniciar el equipo si lleva más de 48 horas encendido.",
      "Cerrar aplicaciones de alto consumo no críticas.",
      "Validar espacio disponible en disco.",
      "Ejecutar actualización corporativa pendiente si está disponible.",
      "Registrar síntomas recurrentes y horario de mayor impacto.",
    ],
    escalationCriteria: [
      "El equipo presenta fallas de disco, temperatura o batería.",
      "La lentitud impide operar sistemas críticos.",
      "El diagnóstico básico no mejora la experiencia.",
    ],
    tags: ["notebook", "lento", "rendimiento", "hardware", "equipo"],
  },
  {
    id: "kb-wired-peripheral",
    title: "Diagnóstico de mouse o teclado cableado",
    category: "Puesto de trabajo",
    intent: "HARDWARE_ISSUE",
    symptoms: ["Mouse no funciona", "Teclado no responde", "Periférico USB no detectado"],
    resolutionSteps: [
      "Confirmar si el periférico es cableado, inalámbrico o Bluetooth.",
      "Probar otro puerto USB del equipo, evitando hubs o adaptadores intermedios.",
      "Validar si el periférico enciende luz o aparece como dispositivo conectado.",
      "Probar otro periférico en el mismo equipo para aislar si falla el puerto o el accesorio.",
      "Registrar activo afectado y resultado del descarte antes de escalar.",
    ],
    escalationCriteria: [
      "El periférico no enciende ni es detectado en ningún puerto.",
      "Otro periférico tampoco funciona en el equipo.",
      "El usuario queda sin capacidad operativa para trabajar.",
    ],
    tags: ["mouse", "raton", "ratón", "teclado", "usb", "cable", "puerto", "enciende", "detecta", "conectado", "periferico", "periférico"],
  },
  {
    id: "kb-shared-folder-access",
    title: "Solicitud de acceso a carpeta compartida",
    category: "Accesos y permisos",
    intent: "ACCESS_REQUEST",
    symptoms: ["Sin acceso a carpeta", "Permiso denegado", "Requiere carpeta compartida"],
    resolutionSteps: [
      "Identificar ruta o nombre de la carpeta compartida.",
      "Confirmar responsable del recurso y nivel de permiso requerido.",
      "Solicitar aprobación del dueño de la información.",
      "Registrar requerimiento con vigencia del acceso.",
    ],
    escalationCriteria: [
      "No existe responsable definido.",
      "El acceso incluye información sensible.",
      "La solicitud requiere aprobación de seguridad.",
    ],
    tags: ["carpeta", "share", "permisos", "acceso", "archivo"],
  },
  {
    id: "kb-critical-app",
    title: "Incidente crítico de aplicación corporativa",
    category: "Aplicaciones corporativas",
    intent: "INCIDENT",
    symptoms: ["Aplicación caída", "Servicio crítico indisponible", "Impacto masivo"],
    resolutionSteps: [
      "Confirmar alcance: usuario único, área completa o múltiples sedes.",
      "Registrar hora de inicio y mensaje de error.",
      "Validar si existe workaround operativo aprobado.",
      "Escalar a equipo resolutor con prioridad alta o crítica.",
    ],
    escalationCriteria: [
      "Afecta proceso crítico de negocio.",
      "Afecta múltiples usuarios o áreas.",
      "No existe workaround disponible.",
    ],
    tags: ["crítica", "aplicación", "caída", "erp", "indisponible", "producción"],
  },
];

export function findKnowledgeMatches(message: string, intent?: ITSMIntent) {
  const normalizedMessage = normalizeSearchText(message);

  return knowledgeBase
    .map((article) => {
      const intentScore = intent && article.intent === intent ? 5 : 0;
      const tagScore = article.tags.filter((tag) => normalizedMessage.includes(normalizeSearchText(tag))).length * 2;
      const symptomScore = article.symptoms.filter((symptom) =>
        normalizedMessage.includes(normalizeSearchText(symptom)),
      ).length;

      return { article, score: intentScore + tagScore + symptomScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article);
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
