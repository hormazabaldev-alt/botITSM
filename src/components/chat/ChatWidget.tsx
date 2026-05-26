"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import type { ChatMessage, ITSMResponse, OperationalStatus, SessionContext, Ticket } from "@/lib/itsm/types";

type ChatApiResponse = {
  response: ITSMResponse;
  sessionContext: SessionContext;
};

const quickCases = [
  "No puedo acceder a mi correo",
  "Necesito instalar software autorizado",
  "Mi notebook está muy lento",
  "No funciona la VPN",
  "Necesito acceso a una carpeta compartida",
  "Se cayó una aplicación crítica",
];

const initialAssistant: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hola. Soy el Agente IA ITSM Enterprise. Selecciona un caso demo o describe el problema; clasificaré el caso, aplicaré una guía ITIL y lo cerraré o escalaré con contexto.",
  createdAt: new Date().toISOString(),
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistant]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<SessionContext | undefined>();
  const [statuses, setStatuses] = useState<OperationalStatus[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canSend = input.trim().length > 0 && !isLoading;

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("open-itsm-chat", handler);
    return () => window.removeEventListener("open-itsm-chat", handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeTicket, statuses]);

  const headerState = useMemo(() => {
    if (isLoading) return "Procesando flujo ITIL";
    if (activeTicket) return "Ticket simulado creado";
    if (context?.detectedIntent) return "Caso clasificado";
    return "Disponible en modo demo";
  }, [activeTicket, context?.detectedIntent, isLoading]);

  async function sendMessage(message: string) {
    const cleanMessage = message.trim();
    if (!cleanMessage || isLoading) return;

    setIsOpen(true);
    setInput("");
    setActiveTicket(null);
    setIsLoading(true);
    setStatuses(["Detectando intención"]);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: cleanMessage, sessionContext: context }),
      });

      if (!response.ok) throw new Error("No se pudo procesar el mensaje");

      const payload = (await response.json()) as ChatApiResponse;
      setContext(payload.sessionContext);
      setStatuses(payload.response.operationalStatuses);
      setMessages(payload.sessionContext.messages.length ? [initialAssistant, ...payload.sessionContext.messages] : [initialAssistant]);

      if (payload.response.shouldCreateTicket) {
        setStatuses((current) => (current.includes("Preparando ticket") ? current : [...current, "Preparando ticket"]));
        const ticketResponse = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketDraft: payload.response.ticketDraft }),
        });
        const ticketPayload = (await ticketResponse.json()) as { ticket: Ticket };
        setActiveTicket(ticketPayload.ticket);
      }
    } catch {
      const fallback: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "No pude completar el procesamiento local en este momento. La demo sigue sin usar servicios externos; intenta nuevamente con un caso precargado.",
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, fallback]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid size-16 place-items-center rounded-2xl bg-[#08233f] text-white shadow-2xl shadow-cyan-950/30 transition hover:-translate-y-1 hover:bg-[#123b63]"
        aria-label="Abrir agente ITSM"
      >
        <MessageSquare size={28} aria-hidden />
      </button>

      {isOpen ? (
        <section className="fixed bottom-24 right-4 z-50 flex max-h-[calc(100vh-112px)] w-[calc(100vw-32px)] max-w-[460px] flex-col overflow-hidden rounded-[8px] border border-[#b8dbe9] bg-white shadow-2xl shadow-[#08233f]/20 sm:right-6">
          <div className="border-b border-[#d7e7f1] bg-[#08233f] p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-[8px] bg-[#00b8d9]">
                  <Bot size={22} aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-bold">Agente IA ITSM Enterprise</h2>
                  <p className="mt-1 text-xs font-medium text-cyan-100">{headerState}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-9 place-items-center rounded-[8px] text-cyan-50 transition hover:bg-white/10"
                aria-label="Cerrar agente ITSM"
              >
                <X size={19} aria-hidden />
              </button>
            </div>
          </div>

          <div className="border-b border-[#d7e7f1] bg-[#f7fbff] px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#0d5374]">
              <ShieldCheck size={15} aria-hidden />
              Estados operacionales
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 thin-scrollbar">
              {(statuses.length ? statuses : ["Detectando intención", "Clasificando según ITIL"]).map((status, index) => (
                <span
                  key={`${status}-${index}`}
                  className="shrink-0 rounded-full border border-[#bfe4ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#35566f]"
                >
                  {status}
                </span>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="thin-scrollbar flex-1 overflow-y-auto bg-white p-4">
            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {quickCases.map((quickCase) => (
                <button
                  key={quickCase}
                  type="button"
                  onClick={() => sendMessage(quickCase)}
                  disabled={isLoading}
                  className="rounded-[8px] border border-[#d7e7f1] bg-[#f7fbff] px-3 py-2 text-left text-xs font-semibold text-[#08233f] transition hover:border-[#00b8d9] hover:bg-[#effbfe] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {quickCase}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[86%] rounded-[8px] bg-[#08233f] px-4 py-3 text-sm leading-6 text-white"
                        : "max-w-[90%] rounded-[8px] border border-[#d7e7f1] bg-[#f7fbff] px-4 py-3 text-sm leading-6 text-[#183b56]"
                    }
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    {message.metadata?.intent ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#dff8fd] px-2.5 py-1 text-[11px] font-bold text-[#007d9a]">
                          {message.metadata.intent}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#08233f]">
                          {message.metadata.priority}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {isLoading ? (
                <div className="flex items-center gap-2 rounded-[8px] border border-[#d7e7f1] bg-[#f7fbff] px-4 py-3 text-sm font-semibold text-[#35566f]">
                  <Loader2 className="animate-spin text-[#00a8c8]" size={18} aria-hidden />
                  Aplicando clasificación y guía operacional...
                </div>
              ) : null}

              {activeTicket ? <TicketSummary ticket={activeTicket} /> : null}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#d7e7f1] bg-[#f7fbff] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Describe el caso o responde si se resolvió..."
                rows={2}
                className="min-h-12 flex-1 resize-none rounded-[8px] border border-[#c8ddea] bg-white px-3 py-3 text-sm text-[#08233f] outline-none transition placeholder:text-[#8aa1b4] focus:border-[#00b8d9] focus:ring-4 focus:ring-cyan-100"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="grid size-12 place-items-center rounded-[8px] bg-[#00a8c8] text-white transition hover:bg-[#008fad] disabled:cursor-not-allowed disabled:bg-[#9bcbd6]"
                aria-label="Enviar mensaje"
              >
                <Send size={19} aria-hidden />
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </>
  );
}

function TicketSummary({ ticket }: { ticket: Ticket }) {
  return (
    <article className="rounded-[8px] border border-[#8bd7e8] bg-[#f0fbfe] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-[#007d9a]" aria-hidden />
          <h3 className="text-sm font-bold text-[#08233f]">Ticket simulado {ticket.id}</h3>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#007d9a]">{ticket.priority}</span>
      </div>

      <dl className="mt-4 grid gap-3 text-xs">
        <TicketRow label="Tipo" value={ticket.type} />
        <TicketRow label="Categoría" value={ticket.category} />
        <TicketRow label="Descripción" value={ticket.description} />
        <TicketRow label="Pasos ejecutados" value={ticket.executedSteps.join(" | ")} />
        <TicketRow label="Siguiente acción" value={ticket.nextAction} />
        <TicketRow label="Asignado a" value={ticket.assignedTeam} />
        <TicketRow label="SLA estimado" value={ticket.estimatedSla} />
      </dl>

      <div className="mt-4 flex items-center gap-2 rounded-[8px] bg-white px-3 py-2 text-xs font-semibold text-[#35566f]">
        <CheckCircle2 size={15} className="text-[#047857]" aria-hidden />
        Contexto preparado para integración futura con ITSM.
      </div>
    </article>
  );
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold uppercase tracking-[0.08em] text-[#5a7186]">{label}</dt>
      <dd className="mt-1 leading-5 text-[#08233f]">{value}</dd>
    </div>
  );
}
