"use client";

import { useEffect, useState } from "react";
import { getStoredSettings, setStoredSettings, ProfileSettings, DEFAULT_SETTINGS } from "../../../utils/db";

export default function AdminSettings() {
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredSettings(settings);
    setSaveStatus("SAVED");
    
    // Dispatch custom event to notify layout/other components immediately
    window.dispatchEvent(new Event("settings_updated"));

    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <span className="font-[600] text-[12px] tracking-[0.2em] text-primary mb-4 block uppercase font-body">
            SYSTEM PREFERENCES
          </span>
          <h1 className="font-display text-[32px] md:text-[48px] font-semibold text-on-surface leading-tight">
            Profile & Site Configuration
          </h1>
        </div>
        
        {saveStatus === "SAVED" ? (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-8 py-4 rounded-xl font-bold">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Settings Saved
          </div>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(163,201,255,0.2)] transition-all group cursor-pointer active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined">save</span>
            Save Configurations
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Hero/Avatar & Contact links */}
        <div className="md:col-span-4 space-y-6">
          {/* Avatar Details Card */}
          <div className="glass-card p-6 rounded-3xl text-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-2 border-primary/20 bg-surface-container-low relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.portraitUrl || "/meet_nakum.jpg"}
                alt="Meet Nakum"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{settings.name}</h3>
              <p className="text-on-surface-variant text-xs mt-1">{settings.subtitle}</p>
            </div>
            
            <div className="space-y-2 text-left pt-4 border-t border-white/5">
              <label className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
                Portrait Image URL
              </label>
              <input
                required
                value={settings.portraitUrl}
                onChange={(e) => setSettings({ ...settings, portraitUrl: e.target.value })}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/40 text-on-surface font-body"
                placeholder="/meet_nakum.jpg"
                type="text"
              />
            </div>
          </div>

          {/* Social Connections */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-display font-bold text-sm text-primary uppercase tracking-wider mb-2">
              Social Links
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">GitHub</label>
                <input
                  value={settings.github}
                  onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="text"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">LinkedIn</label>
                <input
                  value={settings.linkedin}
                  onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="text"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase">Twitter</label>
                <input
                  value={settings.twitter}
                  onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Copy & Settings detail form */}
        <div className="md:col-span-8 space-y-6">
          {/* Section: Hero Banner */}
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <h3 className="font-display font-bold text-lg border-b border-white/5 pb-3">Hero Section Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                  FULL NAME
                </label>
                <input
                  required
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="text"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                  TITLE CAPTIONS
                </label>
                <input
                  required
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                  ACADEMIC TAGLINE (e.g. M.TECH AI & DS)
                </label>
                <input
                  required
                  value={settings.role}
                  onChange={(e) => setSettings({ ...settings, role: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                  ROLE SUBTITLE (e.g. AGENTIC AI DEVELOPER)
                </label>
                <input
                  required
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                HERO DESCRIPTION BIO
              </label>
              <textarea
                required
                value={settings.heroBio}
                onChange={(e) => setSettings({ ...settings, heroBio: e.target.value })}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Section: About & Counters */}
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <h3 className="font-display font-bold text-lg border-b border-white/5 pb-3">About & Metrics</h3>

            <div className="space-y-2">
              <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                ABOUT SECTION TITLE
              </label>
              <input
                required
                value={settings.aboutTitle}
                onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body"
                type="text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                ABOUT BIO DESCRIPTION
              </label>
              <textarea
                required
                value={settings.aboutBio}
                onChange={(e) => setSettings({ ...settings, aboutBio: e.target.value })}
                className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body resize-none"
                rows={4}
              />
            </div>

            {/* Counters grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-bold text-primary tracking-widest uppercase">Metrics Card A</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <input
                      required
                      value={settings.stat1Value}
                      onChange={(e) => setSettings({ ...settings, stat1Value: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-2 py-1 text-xs text-on-surface font-semibold"
                      placeholder="95%"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      required
                      value={settings.stat1Label}
                      onChange={(e) => setSettings({ ...settings, stat1Label: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-2 py-1 text-xs text-on-surface-variant"
                      placeholder="Inference Efficiency"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-bold text-primary tracking-widest uppercase">Metrics Card B</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <input
                      required
                      value={settings.stat2Value}
                      onChange={(e) => setSettings({ ...settings, stat2Value: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-2 py-1 text-xs text-on-surface font-semibold"
                      placeholder="12+"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      required
                      value={settings.stat2Label}
                      onChange={(e) => setSettings({ ...settings, stat2Label: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-2 py-1 text-xs text-on-surface-variant"
                      placeholder="Agent Frameworks"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Contacts */}
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <h3 className="font-display font-bold text-lg border-b border-white/5 pb-3">Contact Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                  PUBLIC INQUIRY EMAIL
                </label>
                <input
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] tracking-[0.1em] font-semibold text-on-surface-variant block uppercase">
                  PHYSICAL LOCATION
                </label>
                <input
                  required
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/40 text-on-surface font-body"
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
