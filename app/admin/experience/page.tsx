"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredExperiences, setStoredExperiences, ExperienceItem, DEFAULT_EXPERIENCES } from "../../../utils/db";

export default function AdminExperience() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(DEFAULT_EXPERIENCES);

  useEffect(() => {
    setExperiences(getStoredExperiences());
  }, []);

  const saveExperiences = (updatedExps: ExperienceItem[]) => {
    setExperiences(updatedExps);
    setStoredExperiences(updatedExps);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [newExp, setNewExp] = useState({
    company: "",
    role: "",
    period: "",
    desc: "",
    type: "WORK" as "WORK" | "EDUCATION",
  });

  const handleDelete = (id: string) => {
    saveExperiences(experiences.filter((e) => e.id !== id));
  };

  const handleEditClick = (exp: ExperienceItem) => {
    setEditingExpId(exp.id);
    setNewExp({
      company: exp.company,
      role: exp.role,
      period: exp.period,
      desc: exp.desc,
      type: exp.type,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setNewExp({ company: "", role: "", period: "", desc: "", type: "WORK" });
    setEditingExpId(null);
    setIsModalOpen(false);
  };

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.company || !newExp.role) return;

    if (editingExpId) {
      saveExperiences(
        experiences.map((exp) =>
          exp.id === editingExpId
            ? {
                ...exp,
                company: newExp.company,
                role: newExp.role,
                period: newExp.period,
                desc: newExp.desc,
                type: newExp.type,
              }
            : exp
        )
      );
    } else {
      const added: ExperienceItem = {
        id: Date.now().toString(),
        company: newExp.company,
        role: newExp.role,
        period: newExp.period,
        desc: newExp.desc,
        type: newExp.type,
      };
      saveExperiences([...experiences, added]);
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
            Career Timeline Management
          </h1>
        </div>
        <button
          onClick={() => {
            setNewExp({ company: "", role: "", period: "", desc: "", type: "WORK" });
            setEditingExpId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(163,201,255,0.2)] transition-all group cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Timeline Event
        </button>
      </div>

      {/* Grid of Work and Education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Work Section */}
        <div className="space-y-6">
          <h2 className="font-display text-[22px] font-bold text-on-surface flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">work</span>
            Work Experience
          </h2>
          <div className="space-y-4">
            {experiences.filter((exp) => exp.type === "WORK").length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center text-on-surface-variant text-sm">
                No work experience entries recorded.
              </div>
            ) : (
              experiences
                .filter((exp) => exp.type === "WORK")
                .map((exp) => (
                  <div key={exp.id} className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold">{exp.company}</h3>
                        <p className="text-primary text-xs font-semibold mt-1">{exp.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(exp)}
                          className="p-2 glass-card rounded-lg hover:bg-white/10 transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-2 glass-card rounded-lg hover:bg-error/10 transition-colors text-on-surface-variant hover:text-error cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed text-sm mb-4">{exp.desc}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">
                        {exp.period}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-6">
          <h2 className="font-display text-[22px] font-bold text-on-surface flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-tertiary">school</span>
            Education & Certifications
          </h2>
          <div className="space-y-4">
            {experiences.filter((exp) => exp.type === "EDUCATION").length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center text-on-surface-variant text-sm">
                No education entries recorded.
              </div>
            ) : (
              experiences
                .filter((exp) => exp.type === "EDUCATION")
                .map((exp) => (
                  <div key={exp.id} className="glass-card p-6 rounded-2xl hover:border-tertiary/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold">{exp.company}</h3>
                        <p className="text-tertiary text-xs font-semibold mt-1">{exp.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(exp)}
                          className="p-2 glass-card rounded-lg hover:bg-white/10 transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-2 glass-card rounded-lg hover:bg-error/10 transition-colors text-on-surface-variant hover:text-error cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed text-sm mb-4">{exp.desc}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full font-bold uppercase tracking-wider">
                        {exp.period}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card w-full max-w-2xl rounded-3xl overflow-hidden relative flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-surface-container-low/40">
                <h2 className="font-display text-2xl font-bold text-on-surface">
                  {editingExpId ? "Edit Timeline Event" : "Add Timeline Event"}
                </h2>
                <button
                  className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors cursor-pointer"
                  onClick={handleCloseModal}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveExperience} className="p-8 overflow-y-auto space-y-6 flex-1">
                {/* Form Group: Company/Institution */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    INSTITUTION / COMPANY
                  </label>
                  <input
                    required
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant"
                    placeholder="e.g., Unified Mentors"
                    type="text"
                  />
                </div>

                {/* Form Group: Role / Candidate status */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    ROLE / CERTIFICATE
                  </label>
                  <input
                    required
                    value={newExp.role}
                    onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant"
                    placeholder="e.g., Data Analyst Intern"
                    type="text"
                  />
                </div>

                {/* Form Group: Period */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    TIME PERIOD
                  </label>
                  <input
                    required
                    value={newExp.period}
                    onChange={(e) => setNewExp({ ...newExp, period: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant"
                    placeholder="e.g., 2023 — 2024 or Present"
                    type="text"
                  />
                </div>

                {/* Form Group: Type */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    CLASSIFICATION
                  </label>
                  <select
                    value={newExp.type}
                    onChange={(e) =>
                      setNewExp({ ...newExp, type: e.target.value as "WORK" | "EDUCATION" })
                    }
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface cursor-pointer"
                  >
                    <option value="WORK">WORK EXPERIENCE</option>
                    <option value="EDUCATION">EDUCATION & CERTIFICATIONS</option>
                  </select>
                </div>

                {/* Form Group: Description */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    DESCRIPTION
                  </label>
                  <textarea
                    required
                    value={newExp.desc}
                    onChange={(e) => setNewExp({ ...newExp, desc: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant resize-none"
                    placeholder="Summarize key tasks, findings, projects, or accomplishments..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
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
                    {editingExpId ? "Save Changes" : "Create Entry"}
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
