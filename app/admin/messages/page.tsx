"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredMessages, setStoredMessages, ContactMessage } from "../../../utils/db";

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "ARCHIVED">("ALL");

  useEffect(() => {
    setMessages(getStoredMessages());
  }, []);

  const saveMessages = (updatedMsgs: ContactMessage[]) => {
    setMessages(updatedMsgs);
    setStoredMessages(updatedMsgs);
    // Dispatch events to notify other tabs/layout badges instantly
    window.dispatchEvent(new Event("messages_updated"));
  };

  const handleSelectMessage = (id: string) => {
    setSelectedMsgId(id);
    
    // Mark as read immediately if it was unread
    const updated = messages.map((m) => {
      if (m.id === id && m.status === "UNREAD") {
        return { ...m, status: "READ" as const };
      }
      return m;
    });
    saveMessages(updated);
  };

  const handleToggleStatus = (id: string, newStatus: "UNREAD" | "READ" | "ARCHIVED") => {
    const updated = messages.map((m) => {
      if (m.id === id) {
        return { ...m, status: newStatus };
      }
      return m;
    });
    saveMessages(updated);
  };

  const handleDeleteMessage = (id: string) => {
    if (selectedMsgId === id) {
      setSelectedMsgId(null);
    }
    const updated = messages.filter((m) => m.id !== id);
    saveMessages(updated);
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === "UNREAD") return msg.status === "UNREAD";
    if (filter === "ARCHIVED") return msg.status === "ARCHIVED";
    return msg.status !== "ARCHIVED"; // 'ALL' filter shows Unread and Read, hiding Archived by default
  });

  const activeMessage = messages.find((m) => m.id === selectedMsgId);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 relative z-10 flex flex-col h-[calc(100vh-72px)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between shrink-0 gap-4 mb-2">
        <div>
          <span className="font-[600] text-[12px] tracking-[0.2em] text-primary mb-2 block uppercase font-body">
            INCOMING TRANSMISSIONS
          </span>
          <h1 className="font-display text-[32px] font-bold text-on-surface">
            Contact Form Inbox
          </h1>
        </div>
        <div className="flex gap-2 bg-surface-container-low border border-white/5 rounded-xl p-1 shrink-0">
          {(["ALL", "UNREAD", "ARCHIVED"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                filter === opt
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Main split dashboard panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0 pb-6">
        {/* Left Column: Messages List */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-0">
            <AnimatePresence initial={false}>
              {filteredMessages.length === 0 ? (
                <div className="glass-card p-10 rounded-2xl text-center text-on-surface-variant text-sm h-48 flex flex-col items-center justify-center gap-4">
                  <span className="material-symbols-outlined text-4xl opacity-20">mail_outline</span>
                  No messages in this folder.
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = msg.id === selectedMsgId;
                  const isUnread = msg.status === "UNREAD";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => handleSelectMessage(msg.id)}
                      className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 border-l-4 text-left ${
                        isSelected
                          ? "bg-white/[0.06] border-l-primary"
                          : isUnread
                          ? "border-l-primary/45 bg-primary/5"
                          : "border-l-transparent hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-on-surface leading-tight truncate mr-2">
                          {msg.name}
                        </span>
                        <span className="text-[9px] text-on-surface-variant font-semibold tracking-wider uppercase shrink-0">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-primary tracking-wide uppercase mb-2 truncate">
                        {msg.subject}
                      </div>
                      <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed">
                        {msg.message}
                      </p>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Full Message Reader */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
          {activeMessage ? (
            <div className="glass-card rounded-[2rem] p-8 flex flex-col h-full overflow-hidden">
              {/* Toolbar */}
              <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-6 shrink-0">
                <div className="flex items-center gap-2">
                  {activeMessage.status === "READ" ? (
                    <button
                      onClick={() => handleToggleStatus(activeMessage.id, "UNREAD")}
                      title="Mark as unread"
                      className="p-3 glass-card rounded-xl hover:bg-white/10 text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">mark_as_unread</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(activeMessage.id, "READ")}
                      title="Mark as read"
                      className="p-3 glass-card rounded-xl hover:bg-white/10 text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">drafts</span>
                    </button>
                  )}
                  {activeMessage.status !== "ARCHIVED" && (
                    <button
                      onClick={() => handleToggleStatus(activeMessage.id, "ARCHIVED")}
                      title="Archive message"
                      className="p-3 glass-card rounded-xl hover:bg-white/10 text-on-surface-variant hover:text-tertiary transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">archive</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteMessage(activeMessage.id)}
                  title="Delete message"
                  className="p-3 glass-card rounded-xl hover:bg-error/10 text-on-surface-variant hover:text-error transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>

              {/* Reader Body */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 min-h-0">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-primary tracking-widest uppercase">FROM</div>
                  <h2 className="text-xl font-bold font-display text-on-surface">{activeMessage.name}</h2>
                  <a
                    href={`mailto:${activeMessage.email}`}
                    className="text-on-surface-variant text-sm hover:text-primary transition-colors inline-block"
                  >
                    {activeMessage.email}
                  </a>
                </div>

                <div className="space-y-1 border-t border-white/5 pt-4">
                  <div className="text-[10px] font-bold text-primary tracking-widest uppercase">SUBJECT</div>
                  <h3 className="text-base font-semibold text-on-surface">{activeMessage.subject}</h3>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="text-[10px] font-bold text-primary tracking-widest uppercase">TRANSMISSION CONTENT</div>
                  <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
                    {activeMessage.message}
                  </p>
                </div>
              </div>

              {/* Reply Footer */}
              <div className="border-t border-white/5 pt-6 mt-6 shrink-0">
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                  className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(163,201,255,0.4)] transition-all active:scale-[0.98] text-center"
                >
                  <span className="material-symbols-outlined text-lg">reply</span>
                  Reply via Email Client
                </a>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-[2rem] p-8 flex flex-col items-center justify-center text-center text-on-surface-variant h-full opacity-60">
              <span className="material-symbols-outlined text-6xl mb-4 text-primary/40">mail</span>
              <p className="text-sm font-medium">Select a transmission from the inbox to read.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
