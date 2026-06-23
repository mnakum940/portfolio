"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredSkills, setStoredSkills, Skill, DEFAULT_SKILLS } from "../../../utils/db";

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);

  useEffect(() => {
    setSkills(getStoredSkills());

    const handleSync = (e: StorageEvent) => {
      if (e.key === "portfolio_skills") {
        setSkills(getStoredSkills());
      }
    };
    const handleCustom = () => {
      setSkills(getStoredSkills());
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("skills_updated", handleCustom);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("skills_updated", handleCustom);
    };
  }, []);

  const saveSkills = (updatedSkills: Skill[]) => {
    setSkills(updatedSkills);
    setStoredSkills(updatedSkills);
    window.dispatchEvent(new Event("skills_updated"));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState({ name: "", icon: "" });

  const handleDelete = (id: string) => {
    saveSkills(skills.filter((s) => s.id !== id));
  };

  const handleEditClick = (skill: Skill) => {
    setEditingSkillId(skill.id);
    setNewSkill({ name: skill.name, icon: skill.icon });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setNewSkill({ name: "", icon: "" });
    setEditingSkillId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name) return;

    if (editingSkillId) {
      saveSkills(
        skills.map((s) =>
          s.id === editingSkillId
            ? { ...s, name: newSkill.name, icon: newSkill.icon || "⚙️" }
            : s
        )
      );
    } else {
      const added: Skill = {
        id: `skill-${Date.now()}`,
        name: newSkill.name,
        icon: newSkill.icon || "⚙️",
      };
      saveSkills([...skills, added]);
    }

    handleCloseModal();
  };

  const moveSkill = (index: number, direction: "up" | "down") => {
    const updated = [...skills];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    saveSkills(updated);
  };

  // Common emoji suggestions for quick picking
  const emojiSuggestions = [
    "🐍", "🔥", "🔗", "🧠", "✨", "⚡", "🍃", "🐳",
    "☸️", "▲", "⚛️", "📘", "🐘", "🔴", "☁️", "🌐",
    "📂", "🐧", "🤗", "📊", "🛡️", "🔧", "💎", "🎯",
    "⚙️", "🔬", "📡", "🧩", "🏗️", "🚀",
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="font-[600] text-[12px] tracking-[0.2em] text-primary mb-4 block uppercase font-body">
            ADMIN DASHBOARD
          </span>
          <h1 className="font-display text-[32px] md:text-[48px] font-semibold text-on-surface leading-tight">
            Skills & Technologies
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-lg">
            Manage the skills displayed in the scrolling marquee and popup on
            your public portfolio. Changes sync instantly.
          </p>
        </div>
        <button
          onClick={() => {
            setNewSkill({ name: "", icon: "" });
            setEditingSkillId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(163,201,255,0.2)] transition-all group cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add New Skill
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="glass-card rounded-xl px-6 py-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">bar_chart</span>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">{skills.length}</p>
            <p className="text-[10px] tracking-wider uppercase text-on-surface-variant font-semibold">Total Skills</p>
          </div>
        </div>
        <div className="glass-card rounded-xl px-6 py-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">animation</span>
          <div>
            <p className="text-2xl font-display font-bold text-on-surface">{skills.length}</p>
            <p className="text-[10px] tracking-wider uppercase text-on-surface-variant font-semibold">In Marquee</p>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-2xl p-5 group hover:border-primary/30 transition-all duration-300 relative"
          >
            {/* Reorder Controls */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => moveSkill(index, "up")}
                disabled={index === 0}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              </button>
              <button
                onClick={() => moveSkill(index, "down")}
                disabled={index === skills.length - 1}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              </button>
            </div>

            {/* Skill Content */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                {skill.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-on-surface truncate">{skill.name}</h3>
                <p className="text-[10px] tracking-wider uppercase text-on-surface-variant/60 font-semibold">
                  #{index + 1} in marquee
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-white/5">
              <button
                onClick={() => handleEditClick(skill)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.03] hover:bg-white/10 text-on-surface-variant hover:text-primary transition-all text-xs font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit
              </button>
              <button
                onClick={() => handleDelete(skill.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.03] hover:bg-error/10 text-on-surface-variant hover:text-error transition-all text-xs font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Remove
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {skills.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">psychology</span>
          <h3 className="font-display text-xl font-bold text-on-surface mb-2">No Skills Added</h3>
          <p className="text-on-surface-variant mb-6">Add your first skill to populate the marquee animation.</p>
          <button
            onClick={() => {
              setNewSkill({ name: "", icon: "" });
              setEditingSkillId(null);
              setIsModalOpen(true);
            }}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold cursor-pointer active:scale-95 transition-transform"
          >
            Add Your First Skill
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
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
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
                  {editingSkillId ? "Edit Skill" : "Add New Skill"}
                </h2>
                <button
                  className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors cursor-pointer"
                  onClick={handleCloseModal}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 flex-1">
                {/* Skill Name */}
                <div className="space-y-2">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    SKILL NAME
                  </label>
                  <input
                    required
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant"
                    placeholder="e.g., TensorFlow, Rust, GraphQL..."
                    type="text"
                  />
                </div>

                {/* Icon */}
                <div className="space-y-3">
                  <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                    ICON (EMOJI)
                  </label>
                  <input
                    value={newSkill.icon}
                    onChange={(e) => setNewSkill({ ...newSkill, icon: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-0 transition-all text-on-surface placeholder:text-outline-variant text-2xl text-center"
                    placeholder="⚙️"
                    type="text"
                  />
                  <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider font-semibold">
                    Quick pick an emoji:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {emojiSuggestions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewSkill({ ...newSkill, icon: emoji })}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer ${
                          newSkill.icon === emoji
                            ? "bg-primary/20 border-primary/50 border scale-110"
                            : "bg-white/[0.03] border border-white/5 hover:bg-white/10 hover:scale-105"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {newSkill.name && (
                  <div className="space-y-2">
                    <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                      PREVIEW
                    </label>
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-2xl">
                        {newSkill.icon || "⚙️"}
                      </div>
                      <div>
                        <p className="font-display font-bold text-on-surface">{newSkill.name}</p>
                        <p className="text-xs text-on-surface-variant/60">
                          Marquee: <span className="font-display font-bold tracking-wider">{newSkill.name.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                    {editingSkillId ? "Save Changes" : "Add Skill"}
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
