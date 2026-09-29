'use client';

import React, { useRef } from 'react';
import { useDocumentationStore } from '../../lib/store/useDocumentationStore';
import { CoverStyle, FontFamily } from '@/lib/types/documentation';
import {
  Palette,
  Upload,
  Trash2,
  Check,
  Type,
  Layout,
  X,
  Sparkles,
  Terminal,
} from 'lucide-react';

const PRESET_PALETTES = [
  {
    name: 'Postman Official',
    primary: '#FF6C37',
    secondary: '#212121',
    accent: '#0CBB52',
    isPostman: true,
  },
  {
    name: 'Indigo SaaS',
    primary: '#4f46e5',
    secondary: '#6366f1',
    accent: '#06b6d4',
  },
  {
    name: 'Classic Blue',
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#0ea5e9',
  },
  {
    name: 'Modern Emerald',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#14b8a6',
  },
  {
    name: 'Corporate Navy',
    primary: '#0f172a',
    secondary: '#334155',
    accent: '#3b82f6',
  },
  {
    name: 'Violet Tech',
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    accent: '#ec4899',
  },
];

const AVAILABLE_FONTS: { name: FontFamily; label: string; isDefault?: boolean }[] = [
  { name: 'Google Sans', label: 'Google Sans', isDefault: true },
  { name: 'Inter', label: 'Inter' },
  { name: 'Outfit', label: 'Outfit' },
  { name: 'Roboto', label: 'Roboto' },
  { name: 'Roboto Mono', label: 'Roboto Mono' },
  { name: 'Merriweather', label: 'Merriweather' },
];

export const ThemeCustomizerModal: React.FC = () => {
  const {
    project,
    isThemeDrawerOpen,
    setThemeDrawerOpen,
    updateTheme,
    updateMetadata,
  } = useDocumentationStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!project || !isThemeDrawerOpen) return null;

  const { theme, metadata } = project;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateMetadata({ logoUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateMetadata({ logoUrl: undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#FF6C37]" />
            <h3 className="font-bold text-slate-900 text-base">Theme & Branding Customizer</h3>
          </div>
          <button
            type="button"
            onClick={() => setThemeDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Logo Upload */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Brand Logo
          </label>
          <div className="flex items-center gap-4">
            {metadata.logoUrl ? (
              <div className="relative group p-2 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center">
                <img
                  src={metadata.logoUrl}
                  alt="Logo"
                  className="h-12 max-w-[160px] object-contain"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  title="Remove Logo"
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#FF6C37] hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-600 font-medium">
                  Upload Company Logo (PNG, JPG, SVG)
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        {/* 2. Color Presets with Postman Official First */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Color Palette Presets
            </label>
            <span className="text-[11px] text-slate-400">Postman official colors supported</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PRESET_PALETTES.map((preset) => {
              const isSelected = theme.primaryColor.toLowerCase() === preset.primary.toLowerCase();
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    updateTheme({
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                      accentColor: preset.accent,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-[#FF6C37] bg-[#FF6C37]/5 shadow-xs ring-1 ring-[#FF6C37]'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800 block">
                        {preset.name}
                      </span>
                      {preset.isPostman && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FF6C37] text-white">
                          POSTMAN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#FF6C37]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="p-1.5 border border-slate-300 rounded font-mono text-xs flex-1 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Secondary / Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={theme.secondaryColor}
                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                className="p-1.5 border border-slate-300 rounded font-mono text-xs flex-1 uppercase"
              />
            </div>
          </div>
        </div>

        {/* 4. Typography with Google Sans as Default */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Document Typography (Default: Google Sans)
            </label>
            <span className="text-[11px] text-[#0CBB52] font-semibold">Active: {theme.fontFamily}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AVAILABLE_FONTS.map((fontItem) => {
              const isSelected = theme.fontFamily === fontItem.name;
              return (
                <button
                  key={fontItem.name}
                  type="button"
                  onClick={() => updateTheme({ fontFamily: fontItem.name })}
                  className={`p-2.5 rounded-xl border text-center text-xs transition-all relative ${
                    isSelected
                      ? 'border-[#FF6C37] bg-[#FF6C37]/10 text-slate-900 font-bold ring-1 ring-[#FF6C37]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  style={{ fontFamily: fontItem.name === 'Google Sans' ? `'Google Sans', sans-serif` : fontItem.name }}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{fontItem.label}</span>
                    {fontItem.isDefault && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0CBB52] text-white">
                        DEFAULT
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Terminal & Code Font Info */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Terminal className="w-4 h-4 text-[#FF6C37]" />
            <span>Code & Terminal Font: Consolas</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            All JSON payloads, cURL snippets, and response bodies are rendered using authentic Consolas typography inside Monaco Editor.
          </p>
        </div>

        {/* 6. Cover Style */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Cover Page Design Style
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['corporate', 'modern', 'minimal'] as CoverStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => updateTheme({ coverStyle: style })}
                className={`p-3 rounded-xl border text-center capitalize text-xs font-semibold transition-all ${
                  theme.coverStyle === style
                    ? 'border-[#FF6C37] bg-[#FF6C37]/5 text-slate-900 ring-1 ring-[#FF6C37]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => setThemeDrawerOpen(false)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
