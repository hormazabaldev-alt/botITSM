"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronUp,
  Headset,
  KeyRound,
  Laptop,
  Loader2,
  MessageSquareText,
  Minus,
  PackageCheck,
  Paperclip,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRound,
  Wifi,
  X,
} from "lucide-react";
import type { ChatMessage, ITSMResponse, OperationalStatus, SessionContext, Ticket } from "@/lib/itsm/types";

type ChatApiResponse = {
  response: ITSMResponse;
  sessionContext: SessionContext;
  ticket?: Ticket;
};

const sessionContextStorageKey = "atlas-active-session-context";

const smartActions = [
  {
    topic: "No puedo entrar al correo",
    title: "Acceso",
    icon: KeyRound,
    accent: "from-amber-300 to-orange-400",
  },
  {
    topic: "VPN no funciona",
    title: "Conectividad",
    icon: Wifi,
    accent: "from-cyan-300 to-blue-400",
  },
  {
    topic: "Necesito instalar software",
    title: "Software",
    icon: PackageCheck,
    accent: "from-blue-300 to-indigo-400",
  },
  {
    topic: "Mi notebook está lenta",
    title: "Hardware",
    icon: Laptop,
    accent: "from-slate-300 to-slate-500",
  },
  {
    topic: "Necesito acceso",
    title: "Incidente",
    icon: AlertTriangle,
    accent: "from-rose-300 to-red-500",
  },
  {
    topic: "Otro problema",
    title: "Otro",
    icon: MessageSquareText,
    accent: "from-violet-300 to-fuchsia-400",
  },
];

const demoScreenshots = [
  {
    name: "screenshot-administrador-tareas-cpu-99.png",
    label: "📊 CPU al 99% (Chrome)",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
        <rect width="400" height="250" rx="8" fill="#1e1e2e"/>
        <text x="20" y="30" fill="#cdd6f4" font-family="monospace" font-size="14" font-weight="bold">Task Manager - Resource Monitor</text>
        <line x1="20" y1="45" x2="380" y2="45" stroke="#313244" stroke-width="2"/>
        <rect x="20" y="60" width="360" height="40" rx="4" fill="#181825"/>
        <text x="30" y="84" fill="#f38ba8" font-family="monospace" font-size="12" font-weight="bold">Google Chrome.exe</text>
        <text x="200" y="84" fill="#f38ba8" font-family="monospace" font-size="12">CPU: 98.4%</text>
        <text x="300" y="84" fill="#a6adc8" font-family="monospace" font-size="12">RAM: 7.2 GB</text>
        <rect x="20" y="110" width="360" height="40" rx="4" fill="#181825"/>
        <text x="30" y="134" fill="#cdd6f4" font-family="monospace" font-size="12">System Idle Process</text>
        <text x="200" y="134" fill="#cdd6f4" font-family="monospace" font-size="12">CPU: 1.2%</text>
        <text x="300" y="134" fill="#a6adc8" font-family="monospace" font-size="12">RAM: 16 KB</text>
        <path d="M 20,230 L 100,210 L 180,225 L 260,160 L 340,90 L 380,80" fill="none" stroke="#f38ba8" stroke-width="3"/>
        <text x="20" y="195" fill="#f38ba8" font-family="monospace" font-size="12" font-weight="bold">CPU UPTIME SPIKE: 99.1%</text>
      </svg>
    `.trim()),
  },
  {
    name: "screenshot-analizador-disco-lleno.png",
    label: "⚠️ Disco C:\\ Lleno",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
        <rect width="400" height="250" rx="8" fill="#1e1e2e"/>
        <text x="20" y="30" fill="#cdd6f4" font-family="monospace" font-size="14" font-weight="bold">This PC - Drive Analyzer</text>
        <line x1="20" y1="45" x2="380" y2="45" stroke="#313244" stroke-width="2"/>
        <rect x="20" y="70" width="60" height="60" rx="6" fill="#313244"/>
        <text x="40" y="108" fill="#bac2de" font-family="sans-serif" font-size="28" font-weight="bold">C:</text>
        <text x="95" y="85" fill="#cdd6f4" font-family="sans-serif" font-size="13" font-weight="bold">OS (C:)</text>
        <rect x="95" y="98" width="280" height="15" rx="3" fill="#313244"/>
        <rect x="95" y="98" width="265" height="15" rx="3" fill="#f38ba8"/>
        <text x="95" y="132" fill="#f38ba8" font-family="sans-serif" font-size="11" font-weight="bold">1.82 GB free of 256 GB (CRITICAL)</text>
        <rect x="20" y="160" width="360" height="70" rx="6" fill="#181825" stroke="#f38ba8" stroke-width="1"/>
        <text x="35" y="185" fill="#f38ba8" font-family="sans-serif" font-size="12" font-weight="bold">⚠️ Alerta de Memoria Virtual:</text>
        <text x="35" y="205" fill="#a6adc8" font-family="sans-serif" font-size="11">El espacio disponible es insuficiente para el archivo pagefile.sys.</text>
      </svg>
    `.trim()),
  },
  {
    name: "screenshot-pantalla-azul-bsod.png",
    label: "❌ Pantallazo Azul (BSOD)",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
        <rect width="400" height="250" rx="8" fill="#0078d7"/>
        <text x="30" y="60" fill="#ffffff" font-family="sans-serif" font-size="48" font-weight="normal">:(</text>
        <text x="30" y="110" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">Su PC sufrió un problema y necesita reiniciarse.</text>
        <text x="30" y="130" fill="#ffffff" font-family="sans-serif" font-size="11">Solo estamos recopilando información sobre el error y luego se reiniciará.</text>
        <text x="30" y="150" fill="#ffffff" font-family="sans-serif" font-size="11">100% completo</text>
        <text x="30" y="185" fill="#ffffff" font-family="monospace" font-size="9" font-weight="bold">Código de parada: DRIVER_IRQL_NOT_LESS_OR_EQUAL</text>
        <text x="30" y="200" fill="#ffffff" font-family="monospace" font-size="9" font-weight="bold">Lo que falló: tcpip.sys</text>
        <text x="30" y="215" fill="#ffffff" font-family="monospace" font-size="9" font-weight="bold">Código de error: STOP 0x000000D1</text>
      </svg>
    `.trim()),
  },
];

const initialMessage: ChatMessage = {
  id: "atlas-welcome",
  role: "assistant",
  createdAt: new Date().toISOString(),
  content: "Hola. Escríbeme qué falla y te guío con el siguiente paso.",
};

const statusLabels: Partial<Record<OperationalStatus, string>> = {
  "Detectando intención": "analizando...",
  "Clasificando según ITIL": "analizando...",
  "Consultando base de conocimiento": "consultando guía...",
  "Ejecutando guía de descarte": "validando guía...",
  "Preparando ticket": "preparando escalamiento...",
  "Cerrando caso": "cerrando...",
};

export function AtlasAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const storedContext = readStoredSessionContext();
    return storedContext?.messages.length ? [initialMessage, ...storedContext.messages] : [initialMessage];
  });
  const [input, setInput] = useState("");
  const [context, setContext] = useState<SessionContext | undefined>(() => readStoredSessionContext());
  const [selectedUserEmail, setSelectedUserEmail] = useState(() => {
    const storedContext = readStoredSessionContext();
    return storedContext?.collectedFields?.correo || "";
  });
  const [status, setStatus] = useState("listo");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [closed, setClosed] = useState(false);
  
  // Estados para Adjuntos de Evidencia Visual
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length <= 1 && !ticket && !isLoading) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, ticket, isLoading, expanded]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 112);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > 112 ? "auto" : "hidden";
  }, [input]);

  const hasConversation = useMemo(() => messages.length > 1, [messages.length]);

  async function sendMessage(
    message: string,
    fileToAttach?: { name: string; url: string } | null,
    overrideContext?: SessionContext
  ) {
    const cleanMessage = message.trim();
    const activeFile = fileToAttach !== undefined ? fileToAttach : attachedFile;
    if (!cleanMessage && !activeFile) return;
    if (isLoading) return;

    setExpanded(true);
    setInput("");
    setAttachedFile(null);
    setShowAttachmentMenu(false);
    setTicket(null);
    setIsLoading(true);
    setStatus("analizando...");

    const optimisticMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanMessage || `[Evidencia Adjunta: ${activeFile?.name}]`,
      createdAt: new Date().toISOString(),
      attachmentName: activeFile?.name,
      attachmentUrl: activeFile?.url,
    };

    setMessages((current) => [...current, optimisticMessage]);

    const activeContext = overrideContext ?? context;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userMessage: cleanMessage || `[Evidencia Adjunta: ${activeFile?.name}]`, 
          sessionContext: activeContext,
          attachmentName: activeFile?.name,
          attachmentUrl: activeFile?.url,
        }),
      });

      if (!response.ok) throw new Error("No se pudo procesar el mensaje");

      const payload = (await response.json()) as ChatApiResponse;
      const refinedContext = refineAssistantTurn(payload.sessionContext, cleanMessage || `[Evidencia: ${activeFile?.name}]`);
      setContext(refinedContext);
      storeSessionContext(refinedContext);
      setMessages([initialMessage, ...refinedContext.messages]);
      setStatus(resolveStatus(payload.response.operationalStatuses));

      if (payload.ticket) {
        setTicket(payload.ticket);
        setStatus("caso registrado");
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Tuve un problema procesando esto. Escríbeme nuevamente qué ocurre y lo retornamos.",
          createdAt: new Date().toISOString(),
        },
      ]);
      setStatus("reintentemos");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function startNewChat() {
    if (isLoading) return;

    clearStoredSessionContext();
    setContext(undefined);
    setMessages([initialMessage]);
    setInput("");
    setTicket(null);
    setAttachedFile(null);
    setShowAttachmentMenu(false);
    setStatus("listo");
    setExpanded(true);
  }

  function handleUserChange(email: string) {
    if (isLoading) return;
    setSelectedUserEmail(email);

    if (!email) {
      clearStoredSessionContext();
      setContext(undefined);
      setMessages([initialMessage]);
      setInput("");
      setTicket(null);
      setAttachedFile(null);
      setShowAttachmentMenu(false);
      setStatus("listo");
      return;
    }

    const userData = email === "lilian.leon@sonda.cl"
      ? { nombre: "Lilian Leon", correo: "lilian.leon@sonda.cl", area: "Operaciones" }
      : { nombre: "Francisco Martinez", correo: "francisco.martinez@sonda.cl", area: "Soporte TI" };

    const newContext: SessionContext = {
      sessionId: `session-${crypto.randomUUID()}`,
      collectedFields: userData,
      messages: [],
      stepsExecuted: [],
    };

    const greetingMsg: ChatMessage = {
      id: "atlas-welcome-personal",
      role: "assistant",
      createdAt: new Date().toISOString(),
      content: `Hola ${userData.nombre}. Soy Atlas, tu asistente de soporte TI de SONDA.\n\nVeo en la CMDB que perteneces al área de ${userData.area}. Escríbeme qué falla con tus equipos y lo resolvemos juntos.`,
    };

    setContext(newContext);
    setMessages([greetingMsg]);
    setInput("");
    setTicket(null);
    setAttachedFile(null);
    setShowAttachmentMenu(false);
    setStatus("listo");
    storeSessionContext(newContext);
  }

  function handleSuggestion(topic: string) {
    if (isLoading) return;

    // Crear un contexto fresco pero preservando el usuario POC activo
    const freshContext: SessionContext = {
      sessionId: `session-${crypto.randomUUID()}`,
      collectedFields: context?.collectedFields ?? {},
      messages: [],
      stepsExecuted: [],
    };

    setContext(freshContext);
    setMessages([initialMessage]);
    setTicket(null);
    setAttachedFile(null);
    setShowAttachmentMenu(false);
    setStatus("listo");

    // Enviar el mensaje con el contexto limpio para iniciar el flujo de forma pura
    void sendMessage(topic, null, freshContext);
  }

  if (closed) {
    return (
      <button
        type="button"
        onClick={() => {
          setClosed(false);
          setExpanded(true);
        }}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-950/92 px-4 text-sm font-semibold text-cyan-50 shadow-[0_18px_60px_rgba(8,47,73,0.26)] backdrop-blur-2xl transition hover:border-cyan-300/50"
      >
        <ShieldCheck size={17} aria-hidden />
        Atlas
      </button>
    );
  }

  return (
    <section className="relative flex h-[min(520px,calc(100dvh-84px))] w-full max-w-[410px] flex-col overflow-hidden rounded-[20px] border border-cyan-200/12 bg-[#07111f]/96 text-slate-100 shadow-[0_24px_80px_rgba(2,8,23,0.34)] ring-1 ring-white/8 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(34,211,238,0.09),transparent_38%)]" />
      <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/42 px-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
            <Headset size={16} aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-[14px] font-semibold text-white">Atlas</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={startNewChat}
            disabled={isLoading}
            title="Iniciar nuevo chat"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 text-[11px] font-semibold text-slate-300 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Iniciar nuevo chat"
          >
            <RotateCcw size={12} aria-hidden />
            Nuevo
          </button>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="grid size-7 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            aria-label={expanded ? "Minimizar asistente" : "Expandir asistente"}
          >
            {expanded ? <Minus size={15} aria-hidden /> : <ChevronUp size={15} aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => setClosed(true)}
            className="grid size-7 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
            aria-label="Cerrar asistente"
          >
            <X size={15} aria-hidden />
          </button>
        </div>
      </header>

      {/* Selector de Usuario POC */}
      <div className="relative shrink-0 border-b border-white/5 bg-slate-950/20 px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] z-10">
        <div className="flex items-center gap-1.5 text-slate-400">
          <UserRound size={12} className="text-cyan-400" aria-hidden />
          <span>POC Sesión:</span>
        </div>
        <select
          value={selectedUserEmail}
          onChange={(e) => handleUserChange(e.target.value)}
          disabled={isLoading}
          className="bg-slate-950 border border-white/10 rounded-md px-1.5 py-0.5 text-slate-200 font-semibold focus:outline-none focus:border-cyan-300/50 cursor-pointer"
        >
          <option value="">Anónimo / Sin Identificar</option>
          <option value="lilian.leon@sonda.cl">Lilian Leon (Operaciones)</option>
          <option value="francisco.martinez@sonda.cl">Francisco Martinez (Soporte TI)</option>
        </select>
      </div>

      {expanded ? (
        <>
          <div ref={scrollRef} className="thin-scrollbar relative min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
            <div className="space-y-2.5">
              {messages.map((message) => (
                <Bubble key={message.id} message={message} />
              ))}

              {!hasConversation ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {smartActions.map((action) => (
                    <SmartActionCard key={action.topic} action={action} onClick={() => handleSuggestion(action.topic)} />
                  ))}
                </div>
              ) : null}

              {isLoading ? <TypingIndicator /> : null}
              {ticket ? <RegisteredCase ticket={ticket} /> : null}
            </div>
          </div>

          <div className="relative shrink-0 border-t border-white/10 bg-slate-950/72 px-3 py-2 backdrop-blur-xl flex flex-col gap-1.5">
            {/* Vista Previa de Archivo Adjunto */}
            {attachedFile && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={attachedFile.url}
                    alt={attachedFile.name}
                    className="size-8 object-cover rounded-md border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-cyan-400">Evidencia cargada listo para enviar</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="grid size-6 place-items-center rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
                  title="Eliminar adjunto"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Menú de Capturas de Demo */}
            {showAttachmentMenu && (
              <div className="rounded-xl border border-white/10 bg-slate-950 p-2 shadow-2xl flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Adjuntar Evidencia (Demo L2)</span>
                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {demoScreenshots.map((shot) => (
                    <button
                      key={shot.name}
                      type="button"
                      onClick={() => {
                        setAttachedFile({ name: shot.name, url: shot.url });
                        setShowAttachmentMenu(false);
                      }}
                      className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2 text-left text-xs font-medium text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-300/5 transition duration-150"
                    >
                      <span className="size-6 overflow-hidden rounded-md border border-white/10 bg-slate-900 shrink-0">
                        <img src={shot.url} alt={shot.label} className="size-full object-cover" />
                      </span>
                      <span>{shot.label}</span>
                    </button>
                  ))}
                  
                  {/* Carga real simulada */}
                  <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-white/[0.01] px-2.5 py-2 text-center text-xs font-semibold text-slate-400 hover:border-cyan-300/35 hover:text-slate-200 transition duration-150 cursor-pointer">
                    <Paperclip size={13} />
                    <span>Subir archivo desde el equipo...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setAttachedFile({
                              name: file.name,
                              url: reader.result as string,
                            });
                            setShowAttachmentMenu(false);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[10.5px] font-medium mb-0.5">
              <div className="flex items-center gap-2 text-slate-400">
                <span className={`size-1.5 rounded-full ${isLoading ? "animate-pulse bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.95)]" : "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]"}`} />
                {status}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setShowAttachmentMenu((prev) => !prev)}
                className={`grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 transition duration-200 ${showAttachmentMenu ? "bg-cyan-300/10 border-cyan-300/40 text-cyan-400" : "bg-white/[0.055] text-slate-300 hover:bg-white/[0.08] hover:text-white"}`}
                title="Adjuntar captura de pantalla"
              >
                <Paperclip size={16} />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                rows={1}
                placeholder={attachedFile ? "Agrega un comentario o envía..." : "Escribe tu mensaje..."}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-2.5 text-[13px] leading-5 text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 focus:border-cyan-300/45 focus:bg-white/[0.075] focus:ring-4 focus:ring-cyan-300/10"
              />

              <button
                type="submit"
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_10px_28px_rgba(34,211,238,0.18)] transition duration-200 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none"
                aria-label="Enviar"
              >
                <Send size={16} aria-hidden />
              </button>
            </form>
          </div>
        </>
      ) : null}
    </section>
  );
}

function WelcomeCard({ message }: { message: string }) {
  return (
    <div className="max-w-[82%] rounded-xl border border-white/10 bg-white/[0.065] px-3 py-2 text-[13px] leading-5 text-slate-200">
      <p>{message}</p>
    </div>
  );
}

function SmartActionCard({
  action,
  onClick,
}: {
  action: (typeof smartActions)[number];
  onClick: () => void;
}) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] px-2 py-1.5 text-left transition duration-200 hover:border-cyan-300/30 hover:bg-white/[0.075] focus:outline-none focus:ring-2 focus:ring-cyan-300/25"
    >
      <span className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${action.accent}`} />
      <span className="relative flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-slate-950/36 text-cyan-100 transition group-hover:border-cyan-300/30 group-hover:text-cyan-50">
          <Icon size={12} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-semibold leading-4 text-slate-50">{action.title}</span>
        </span>
      </span>
    </button>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (message.id === "atlas-welcome") {
    return <WelcomeCard message={message.content} />;
  }

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-300/10 text-cyan-100">
          <Headset size={12} aria-hidden />
        </span>
      ) : null}
      <div
        className={
          isUser
            ? "max-w-[82%] rounded-xl bg-cyan-300 px-3 py-2 text-sm leading-5 text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.14)] flex flex-col gap-2"
            : "max-w-[calc(100%-32px)] rounded-xl border border-white/10 bg-white/[0.065] px-3 py-2 text-[13px] leading-5 text-slate-200 flex flex-col gap-2"
        }
      >
        {message.attachmentUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-950/40 p-1 flex flex-col gap-1">
            <img
              src={message.attachmentUrl}
              alt={message.attachmentName || "Evidencia adjunta"}
              className="max-h-40 object-cover rounded-md"
            />
            <span className="text-[10px] font-mono text-slate-400 block px-1 truncate">
              📎 {message.attachmentName || "evidencia.png"}
            </span>
          </div>
        ) : null}
        
        {message.content ? <p className="whitespace-pre-line">{message.content}</p> : null}
      </div>
      {isUser ? (
        <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.075] text-slate-300">
          <UserRound size={12} aria-hidden />
        </span>
      ) : null}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 pl-9 text-sm text-slate-400">
      <Loader2 size={15} className="animate-spin text-cyan-600" aria-hidden />
      revisando contexto...
    </div>
  );
}

function RegisteredCase({ ticket }: { ticket: Ticket }) {
  return (
    <article className="ml-9 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-4 shadow-[0_16px_40px_rgba(2,8,23,0.18)] flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-cyan-50">
        <CheckCircle2 size={17} className="text-emerald-300" aria-hidden />
        Caso registrado
      </div>
      <p className="font-mono text-xs font-semibold text-cyan-200">{ticket.id}</p>
      <div className="space-y-3 text-sm">
        <CaseLine label="Resumen" value={summarize(ticket.description)} />
        <CaseLine label="Prioridad" value={priorityText(ticket.priority)} />
        <CaseLine label="Próximo paso" value={ticket.assignedTeam.includes("Redes") ? "derivación a soporte de redes" : ticket.nextAction} />
        <CaseLine label="SLA estimado" value={ticket.estimatedSla.replace("respuesta inicial", "")} />
      </div>

      {ticket.attachmentName && (
        <div className="mt-1 border-t border-white/5 pt-3 flex flex-col gap-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">Evidencia Técnica L2</p>
          <div className="flex items-center gap-3 rounded-xl border border-cyan-300/10 bg-slate-950/45 p-2 text-xs">
            {ticket.attachmentUrl ? (
              <img
                src={ticket.attachmentUrl}
                alt={ticket.attachmentName}
                className="size-11 object-cover rounded-lg border border-white/10 shrink-0"
              />
            ) : (
              <Paperclip size={16} className="text-cyan-400 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-200 truncate">{ticket.attachmentName}</p>
              <p className="text-[10.5px] text-slate-400 italic mt-0.5 leading-4">{ticket.attachmentAnalysis || "Análisis técnico completado por Atlas L2"}</p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function CaseLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1 leading-5 text-slate-200">{value}</p>
    </div>
  );
}

function resolveStatus(states: OperationalStatus[]) {
  const state = states.at(-1);
  return (state && statusLabels[state]) ?? "analizando...";
}

function priorityText(priority: Ticket["priority"]) {
  const labels: Record<Ticket["priority"], string> = {
    P1: "Crítica",
    P2: "Alta",
    P3: "Media",
    P4: "Baja",
  };

  return labels[priority];
}

function summarize(description: string) {
  return description.split("|")[0]?.trim() || description;
}

function refineAssistantTurn(sessionContext: SessionContext, userMessage: string): SessionContext {
  const messages = sessionContext.messages.map((message, index, list) => {
    const isLastAssistant = message.role === "assistant" && index === list.length - 1;

    if (!isLastAssistant) {
      return message.role === "assistant" ? { ...message, content: removeAssumedName(message.content) } : message;
    }

    return {
      ...message,
      content: responseForSuggestion(userMessage) ?? removeAssumedName(message.content),
    };
  });

  return { ...sessionContext, messages };
}

function responseForSuggestion(message: string) {
  const normalized = message.trim().toLowerCase();

  if (normalized === "vpn no funciona") {
    return "Entendido.\n\n¿El problema ocurre al conectarte desde fuera de la red corporativa o también dentro de oficina?";
  }

  if (normalized === "no puedo entrar al correo") {
    return "Entendido.\n\n¿El acceso falla por contraseña, MFA o aparece algún mensaje específico en Outlook?";
  }

  if (normalized === "necesito instalar software") {
    return "Entendido.\n\n¿Qué software necesitas instalar y en qué equipo corporativo debe quedar habilitado?";
  }

  if (normalized === "mi notebook está lenta") {
    return "Entendido.\n\n¿La lentitud ocurre desde el inicio del equipo o principalmente al usar una aplicación específica?";
  }

  if (normalized === "necesito acceso") {
    return "Entendido.\n\n¿A qué sistema, carpeta o recurso necesitas acceder y ya cuentas con aprobación del responsable?";
  }

  if (normalized === "otro problema") {
    return "Entendido.\n\nDescríbeme brevemente qué está ocurriendo, desde cuándo pasa y si afecta solo a tu usuario o a más personas.";
  }

  return undefined;
}

function removeAssumedName(message: string) {
  return message
    .replace(/\bHugo,\s*/g, "")
    .replace(/^Hugo,\s*/g, "")
    .trim();
}

function readStoredSessionContext() {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(sessionContextStorageKey);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as SessionContext;
    return Array.isArray(parsed.messages) && Array.isArray(parsed.stepsExecuted) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function storeSessionContext(sessionContext: SessionContext) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(sessionContextStorageKey, JSON.stringify(sessionContext));
}

function clearStoredSessionContext() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(sessionContextStorageKey);
}
