"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  FileText,
  Loader2,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ChatMessage, ITSMResponse, OperationalStatus, SessionContext, Ticket } from "@/lib/itsm/types";

type ChatApiResponse = {
  response: ITSMResponse;
  sessionContext: SessionContext;
};

type CaseConversationProps = {
  initialPrompt?: string;
  onBack: () => void;
};

const fallbackStates: OperationalStatus[] = ["Detectando intención", "Clasificando según ITIL"];

const suggestions = [
  "Ya reinicié el equipo y persiste",
  "Afecta a varios usuarios",
  "Necesito que lo escalen",
  "Funcionó, cerrar caso",
];

export function CaseConversation({ initialPrompt, onBack }: CaseConversationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<SessionContext | undefined>();
  const [states, setStates] = useState<OperationalStatus[]>(fallbackStates);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const bootstrappedPrompt = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentClassification = useMemo(() => context?.detectedIntent?.replaceAll("_", " "), [context?.detectedIntent]);

  const sendMessage = useCallback(async (message: string) => {
    const cleanMessage = message.trim();
    if (!cleanMessage || isLoading) return;

    setInput("");
    setTicket(null);
    setIsLoading(true);
    setStates(["Detectando intención"]);

    const localUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, localUserMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: cleanMessage, sessionContext: context }),
      });

      if (!response.ok) throw new Error("No se pudo procesar el caso");

      const payload = (await response.json()) as ChatApiResponse;
      setContext(payload.sessionContext);
      setStates(payload.response.operationalStatuses);
      setMessages(payload.sessionContext.messages);

      if (payload.response.shouldCreateTicket) {
        const ticketResponse = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketDraft: payload.response.ticketDraft }),
        });

        if (ticketResponse.ok) {
          const ticketPayload = (await ticketResponse.json()) as { ticket: Ticket };
          setTicket(ticketPayload.ticket);
        }
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "No pude completar el análisis en este momento. Intenta nuevamente o deriva el caso a soporte humano.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [context, isLoading]);

  useEffect(() => {
    if (initialPrompt && bootstrappedPrompt.current !== initialPrompt) {
      bootstrappedPrompt.current = initialPrompt;
      void sendMessage(initialPrompt);
    }
  }, [initialPrompt, sendMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, ticket, states]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="support-shell overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
      <header className="border-b border-slate-200/80 bg-white/80 px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Volver al portal"
            >
              <ArrowLeft size={17} aria-hidden />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-950">Gestión de caso</p>
              <p className="text-xs text-slate-500">Clasificación, diagnóstico y trazabilidad operacional</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentClassification ? <StatusBadge tone="cyan">{currentClassification}</StatusBadge> : null}
            {context?.priority ? <StatusBadge tone={context.priority === "P1" ? "red" : "amber"}>{context.priority}</StatusBadge> : null}
          </div>
        </div>
      </header>

      <div className="grid min-h-[620px] lg:grid-cols-[1fr_280px]">
        <div className="flex min-h-[620px] flex-col">
          <div ref={scrollRef} className="thin-scrollbar flex-1 overflow-y-auto px-5 py-6">
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-slate-950 text-white">
                      <Bot size={18} aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Describe el requerimiento con una frase.</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        El caso será clasificado, guiado y cerrado o escalado según impacto y urgencia.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading ? <TypingIndicator /> : null}
              {ticket ? <CaseSummary ticket={ticket} /> : null}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4">
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 thin-scrollbar">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isLoading}
                    onClick={() => sendMessage(suggestion)}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-cyan-300 hover:text-slate-950 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={2}
                  placeholder="Agregar información del caso..."
                  className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/70"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="grid size-12 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="Enviar"
                >
                  <Send size={18} aria-hidden />
                </button>
              </form>
            </div>
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-200">Timeline</p>
          <div className="mt-5 space-y-4">
            {["Detectando", "Clasificado", "Consultando conocimiento", "Resolviendo", ticket ? "Escalando" : "Cerrado"].map(
              (label, index) => (
                <div key={label} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 place-items-center rounded-full border border-cyan-300/40 bg-white/10 text-[11px] font-semibold text-cyan-100">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {states[index] ?? "Pendiente de contexto operacional"}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
          <Bot size={16} aria-hidden />
        </span>
      ) : null}
      <div
        className={
          isUser
            ? "max-w-[82%] rounded-2xl bg-slate-950 px-4 py-3 text-sm leading-6 text-white"
            : "max-w-[86%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
        }
      >
        <p className="whitespace-pre-line">{message.content}</p>
        {message.metadata?.intent ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge tone="cyan">{message.metadata.intent.replaceAll("_", " ")}</StatusBadge>
            {message.metadata.priority ? <StatusBadge tone={message.metadata.priority === "P1" ? "red" : "amber"}>{message.metadata.priority}</StatusBadge> : null}
          </div>
        ) : null}
      </div>
      {isUser ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
          <UserRound size={16} aria-hidden />
        </span>
      ) : null}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
      <Loader2 className="animate-spin text-cyan-600" size={16} aria-hidden />
      Analizando intención, impacto y ruta de resolución...
    </div>
  );
}

function CaseSummary({ ticket }: { ticket: Ticket }) {
  return (
    <article className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <FileText size={17} className="text-cyan-700" aria-hidden />
            Incidente #{ticket.id}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{ticket.description}</p>
        </div>
        <StatusBadge tone={ticket.priority === "P1" ? "red" : "amber"}>{ticket.priority}</StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SummaryItem label="Categoría" value={ticket.category} />
        <SummaryItem label="Estado" value={ticket.status === "escalated" ? "Escalado" : "Registrado"} />
        <SummaryItem label="Acciones ejecutadas" value={ticket.executedSteps.slice(0, 3).join(" · ")} />
        <SummaryItem label="Siguiente paso" value={ticket.nextAction} />
        <SummaryItem label="Equipo asignado" value={ticket.assignedTeam} />
        <SummaryItem label="SLA estimado" value={ticket.estimatedSla} />
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-slate-600">
        <ShieldCheck size={15} className="text-emerald-600" aria-hidden />
        Trazabilidad registrada para seguimiento operacional.
      </div>
    </article>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm leading-5 text-slate-800">{value}</p>
    </div>
  );
}
