"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronUp, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import type { ChatMessage, ITSMResponse, OperationalStatus, SessionContext, Ticket } from "@/lib/itsm/types";

type ChatApiResponse = {
  response: ITSMResponse;
  sessionContext: SessionContext;
};

const frequentTopics = [
  "No puedo entrar al correo",
  "VPN no funciona",
  "Necesito instalar software",
  "Mi notebook está lenta",
  "Necesito acceso",
  "Otro problema",
];

const initialMessage: ChatMessage = {
  id: "atlas-welcome",
  role: "assistant",
  createdAt: new Date().toISOString(),
  content:
    "Hola Hugo 👋\nEstoy aquí para ayudarte con soporte TI.\n\nPuedo ayudarte con accesos, conectividad, software, equipos o incidentes operacionales.\n\nEstos son algunos temas frecuentes:",
};

const statusLabels: Partial<Record<OperationalStatus, string>> = {
  "Detectando intención": "analizando...",
  "Clasificando según ITIL": "analizando...",
  "Consultando base de conocimiento": "consultando guía...",
  "Ejecutando guía de descarte": "revisando pasos...",
  "Preparando ticket": "preparando escalamiento...",
  "Cerrando caso": "cerrando...",
};

export function AtlasAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<SessionContext | undefined>();
  const [status, setStatus] = useState("listo");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, ticket, isLoading, expanded]);

  const hasConversation = useMemo(() => messages.length > 1, [messages.length]);

  async function sendMessage(message: string) {
    const cleanMessage = message.trim();
    if (!cleanMessage || isLoading) return;

    setExpanded(true);
    setInput("");
    setTicket(null);
    setIsLoading(true);
    setStatus("analizando...");

    const optimisticMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: cleanMessage, sessionContext: context }),
      });

      if (!response.ok) throw new Error("No se pudo procesar el mensaje");

      const payload = (await response.json()) as ChatApiResponse;
      setContext(payload.sessionContext);
      setMessages([initialMessage, ...payload.sessionContext.messages]);
      setStatus(resolveStatus(payload.response.operationalStatuses));

      if (payload.response.shouldCreateTicket) {
        const ticketResponse = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketDraft: payload.response.ticketDraft }),
        });

        if (ticketResponse.ok) {
          const ticketPayload = (await ticketResponse.json()) as { ticket: Ticket };
          setTicket(ticketPayload.ticket);
          setStatus("caso registrado");
        }
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Tuve un problema procesando esto. Escríbeme nuevamente qué ocurre y lo retomamos.",
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

  return (
    <section className="w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/70 bg-white/82 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
      <header className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative grid size-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <Sparkles size={18} aria-hidden />
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-[-0.01em] text-slate-950">Atlas ITSM Assistant</h1>
            <p className="text-xs text-slate-500">Soporte inteligente</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="grid size-8 place-items-center rounded-full border border-slate-200 bg-white/80 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          aria-label={expanded ? "Contraer asistente" : "Expandir asistente"}
        >
          <ChevronUp className={`transition ${expanded ? "" : "rotate-180"}`} size={16} aria-hidden />
        </button>
      </header>

      {expanded ? (
        <>
          <div ref={scrollRef} className="thin-scrollbar max-h-[560px] min-h-[360px] overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <Bubble key={message.id} message={message} />
              ))}

              {!hasConversation ? (
                <>
                  <div className="flex flex-wrap gap-2 pl-10">
                    {frequentTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => sendMessage(topic)}
                        className="rounded-full border border-slate-200 bg-white/82 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-slate-950"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <p className="pl-10 text-sm leading-6 text-slate-500">
                    Si lo prefieres, escríbeme directamente qué está ocurriendo.
                  </p>
                </>
              ) : null}

              {isLoading ? <TypingIndicator /> : null}
              {ticket ? <RegisteredCase ticket={ticket} /> : null}
            </div>
          </div>

          <div className="border-t border-slate-200/70 bg-white/70 px-4 py-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span className={`size-1.5 rounded-full ${isLoading ? "animate-pulse bg-cyan-500" : "bg-emerald-500"}`} />
              {status}
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={1}
                placeholder="Escríbeme qué ocurre..."
                className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/70"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Enviar"
              >
                <Send size={17} aria-hidden />
              </button>
            </form>
          </div>
        </>
      ) : null}
    </section>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
          <Sparkles size={14} aria-hidden />
        </span>
      ) : null}
      <div
        className={
          isUser
            ? "max-w-[82%] rounded-2xl bg-slate-950 px-3.5 py-2.5 text-sm leading-6 text-white"
            : "max-w-[84%] rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-700 shadow-sm"
        }
      >
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
      {isUser ? (
        <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
          <UserRound size={14} aria-hidden />
        </span>
      ) : null}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 pl-10 text-sm text-slate-500">
      <Loader2 size={15} className="animate-spin text-cyan-600" aria-hidden />
      pensando con contexto...
    </div>
  );
}

function RegisteredCase({ ticket }: { ticket: Ticket }) {
  return (
    <article className="ml-10 rounded-2xl border border-cyan-200 bg-gradient-to-br from-white to-cyan-50/70 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <CheckCircle2 size={17} className="text-emerald-600" aria-hidden />
        Caso registrado
      </div>
      <p className="mt-1 font-mono text-xs font-semibold text-cyan-700">{ticket.id}</p>
      <div className="mt-4 space-y-3 text-sm">
        <CaseLine label="Resumen" value={summarize(ticket.description)} />
        <CaseLine label="Prioridad" value={priorityText(ticket.priority)} />
        <CaseLine label="Próximo paso" value={ticket.assignedTeam.includes("Redes") ? "derivación a soporte de redes" : ticket.nextAction} />
        <CaseLine label="SLA estimado" value={ticket.estimatedSla.replace("respuesta inicial", "")} />
      </div>
    </article>
  );
}

function CaseLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className="mt-1 leading-5 text-slate-700">{value}</p>
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
