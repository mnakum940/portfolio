"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStoredTestimonials,
  setStoredTestimonials,
  Testimonial,
} from "../../../utils/db";

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    setTestimonials(getStoredTestimonials());

    const handleSync = (e: StorageEvent) => {
      if (e.key === "portfolio_testimonials") {
        setTestimonials(getStoredTestimonials());
      }
    };
    const handleCustom = () => {
      setTestimonials(getStoredTestimonials());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("testimonials_updated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("testimonials_updated", handleCustom);
    };
  }, []);

  const saveTestimonials = (updated: Testimonial[]) => {
    setTestimonials(updated);
    setStoredTestimonials(updated);
    window.dispatchEvent(new Event("testimonials_updated"));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    content: "",
    avatarUrl: "",
  });

  const handleDelete = (id: string) => {
    saveTestimonials(testimonials.filter((t) => t.id !== id));
  };

  const handleEditClick = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      content: testimonial.content,
      avatarUrl: testimonial.avatarUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setForm({ name: "", role: "", company: "", content: "", avatarUrl: "" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role || !form.content) return;

    if (editingId) {
      saveTestimonials(
        testimonials.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: form.name,
                role: form.role,
                company: form.company,
                content: form.content,
                avatarUrl: form.avatarUrl || undefined,
              }
            : t
        )
      );
    } else {
      const added: Testimonial = {
        id: `testimonial-${Date.now()}`,
        name: form.name,
        role: form.role,
        company: form.company,
        content: form.content,
        avatarUrl: form.avatarUrl || undefined,
      };
      saveTestimonials([...testimonials, added]);
    }

    handleCloseModal();
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="font-[600] text-[12px] tracking-[0.2em] text-primary mb-4 block uppercase font-body">
            ADMIN DASHBOARD
          </span>
          <h1 className="font-display text-[32px] md:text-[48px] font-semibold text-on-surface leading-tight">
            Testimonials Control
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-lg">
            Manage feedback from clients, mentors, or colleagues. If zero testimonials are present, the section is auto-hidden from the portfolio.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ name: "", role: "", company: "", content: "", avatarUrl: "" });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(163,201,255,0.2)] transition-all group cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Testimonial
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="glass-card rounded-xl px-6 py-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">format_quote</span>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">{testimonials.length}</p>
            <p className="text-[10px] tracking-wider uppercase text-on-surface-variant font-semibold">
              Total Testimonials
            </p>
          </div>
        </div>
        <div className="glass-card rounded-xl px-6 py-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">visibility</span>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">
              {testimonials.length > 0 ? "VISIBLE" : "HIDDEN"}
            </p>
            <p className="text-[10px] tracking-wider uppercase text-on-surface-variant font-semibold">
              Public Homepage Section
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => {
          const initials = testimonial.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <motion.div
              key={testimonial.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-3xl p-8 group hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <span className="material-symbols-outlined text-primary/30 text-5xl font-light">
                  format_quote
                </span>
                <p className="font-body text-on-surface-variant leading-[1.6] text-[15px] italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5 gap-4">
                <div className="flex items-center gap-4">
                  {testimonial.avatarUrl ? (
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover bg-white/5 border border-white/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm tracking-wider">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-on-surface text-[15px]">
                      {testimonial.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {testimonial.role} {testimonial.company ? `at ${testimonial.company}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEditClick(testimonial)}
                    className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="w-9 h-9 rounded-xl bg-white/[0.03] hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors flex items-center justify-center cursor-pointer"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {testimonials.length === 0 && (
        <div className="glass-card rounded-[32px] p-16 text-center max-w-xl mx-auto space-y-6">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 block">
            format_quote
          </span>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-on-surface">No Testimonials Added</h3>
            <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
              When a testimonial is added here, the section automatically registers and renders on the public landing page.
            </p>
          </div>
          <button
            onClick={() => {
              setForm({ name: "", role: "", company: "", content: "", avatarUrl: "" });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold cursor-pointer active:scale-95 transition-transform inline-block"
          >
            Add Your First Testimonial
          </button>
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card w-full max-w-lg rounded-3xl overflow-hidden relative flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-surface-container-low/40">
                <h2 className="font-display text-2xl font-bold text-on-surface">
                  {editingId ? "Edit Testimonial" : "Add Testimonial"}
                </h2>
                <button
                  className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors cursor-pointer"
                  onClick={handleCloseModal}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 flex-1">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    FULL NAME *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant font-body"
                    placeholder="e.g., Dr. Aris Syntetos"
                    type="text"
                  />
                </div>

                {/* Role & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                      ROLE / DESIGNATION *
                    </label>
                    <input
                      required
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant font-body"
                      placeholder="e.g., Professor / AI Research Lead"
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                      COMPANY / INSTITUTION
                    </label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant font-body"
                      placeholder="e.g., Google DeepMind"
                      type="text"
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    AVATAR IMAGE URL (OPTIONAL)
                  </label>
                  <input
                    value={form.avatarUrl}
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant font-body"
                    placeholder="e.g., https://example.com/avatar.jpg"
                    type="url"
                  />
                </div>

                {/* Quote Content */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    TESTIMONIAL CONTENT *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant font-body resize-none"
                    placeholder="Write the quote here..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    className="px-6 py-3 font-bold text-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-primary/10 cursor-pointer"
                  >
                    {editingId ? "Save Changes" : "Create Testimonial"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
