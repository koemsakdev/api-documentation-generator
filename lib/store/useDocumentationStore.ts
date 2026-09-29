import { create } from 'zustand';
import {
  DocumentationProject,
  DocumentationSection,
  DocumentationTheme,
  DocumentationMetadata,
  Endpoint,
  QualityReport,
} from '../types/documentation';
import { samplePostmanCollection } from '../sample/sample-collection';
import { normalizePostmanCollection } from '../postman/normalizer';
import { calculateQualityReport } from '../postman/quality';

export type AppView = 'landing' | 'overview' | 'workspace';
export type WorkspaceViewMode = 'split' | 'editor' | 'preview';

interface DocumentationStore {
  project: DocumentationProject | null;
  activeView: AppView;
  workspaceViewMode: WorkspaceViewMode;
  selectedSectionId: string | null;
  isThemeDrawerOpen: boolean;
  isExportDialogOpen: boolean;
  isSecretsModalOpen: boolean;
  searchQuery: string;

  // Actions
  setProject: (project: DocumentationProject) => void;
  loadSampleProject: () => void;
  setActiveView: (view: AppView) => void;
  setWorkspaceViewMode: (mode: WorkspaceViewMode) => void;
  setSelectedSectionId: (id: string | null) => void;
  setThemeDrawerOpen: (open: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setSecretsModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Document Editing Actions
  updateMetadata: (metadata: Partial<DocumentationMetadata>) => void;
  updateTheme: (theme: Partial<DocumentationTheme>) => void;
  updateSection: (sectionId: string, updates: Partial<DocumentationSection>) => void;
  updateEndpoint: (sectionId: string, endpointUpdates: Partial<Endpoint>) => void;
  toggleMaskSecrets: () => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (newSections: DocumentationSection[]) => void;
  resetProject: () => void;
}

const STORAGE_KEY = 'api_doc_project_state_v1';

export const useDocumentationStore = create<DocumentationStore>((set, get) => ({
  project: null,
  activeView: 'landing',
  workspaceViewMode: 'split',
  selectedSectionId: null,
  isThemeDrawerOpen: false,
  isExportDialogOpen: false,
  isSecretsModalOpen: false,
  searchQuery: '',

  setProject: (project: DocumentationProject) => {
    // Recalculate health
    project.qualityReport = calculateQualityReport(project);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      }
    } catch (e) {
      console.warn('Unable to persist project to localStorage', e);
    }
    set({
      project,
      activeView: 'overview',
      selectedSectionId: project.sections[0]?.id || null,
    });
  },

  loadSampleProject: () => {
    const project = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });
    set({
      project,
      activeView: 'overview',
      selectedSectionId: project.sections[2]?.id || project.sections[0]?.id,
    });
  },

  setActiveView: (view) => set({ activeView: view }),
  setWorkspaceViewMode: (mode) => set({ workspaceViewMode: mode }),
  setSelectedSectionId: (id) => set({ selectedSectionId: id }),
  setThemeDrawerOpen: (open) => set({ isThemeDrawerOpen: open }),
  setExportDialogOpen: (open) => set({ isExportDialogOpen: open }),
  setSecretsModalOpen: (open) => set({ isSecretsModalOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  updateMetadata: (metaUpdates) => {
    const p = get().project;
    if (!p) return;
    const updated = {
      ...p,
      metadata: { ...p.metadata, ...metaUpdates },
      updatedAt: new Date().toISOString(),
    };
    set({ project: updated });
  },

  updateTheme: (themeUpdates) => {
    const p = get().project;
    if (!p) return;
    const updated = {
      ...p,
      theme: { ...p.theme, ...themeUpdates },
      updatedAt: new Date().toISOString(),
    };
    set({ project: updated });
  },

  updateSection: (sectionId, updates) => {
    const p = get().project;
    if (!p) return;

    function updateSectionRecursive(secs: DocumentationSection[]): DocumentationSection[] {
      return secs.map((sec) => {
        if (sec.id === sectionId) {
          return { ...sec, ...updates };
        }
        if (sec.children) {
          return { ...sec, children: updateSectionRecursive(sec.children) };
        }
        return sec;
      });
    }

    const updatedSections = updateSectionRecursive(p.sections);
    const updatedProject = {
      ...p,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    };
    updatedProject.qualityReport = calculateQualityReport(updatedProject);
    set({ project: updatedProject });
  },

  updateEndpoint: (sectionId, endpointUpdates) => {
    const p = get().project;
    if (!p) return;

    function updateEpRecursive(secs: DocumentationSection[]): DocumentationSection[] {
      return secs.map((sec) => {
        if (sec.id === sectionId && sec.endpoint) {
          return {
            ...sec,
            endpoint: { ...sec.endpoint, ...endpointUpdates },
          };
        }
        if (sec.children) {
          return { ...sec, children: updateEpRecursive(sec.children) };
        }
        return sec;
      });
    }

    const updatedSections = updateEpRecursive(p.sections);
    const updatedProject = {
      ...p,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    };
    updatedProject.qualityReport = calculateQualityReport(updatedProject);
    set({ project: updatedProject });
  },

  toggleMaskSecrets: () => {
    const p = get().project;
    if (!p) return;
    const currentlyMasked = p.secrets.every((s) => s.isMasked);
    const newMaskState = !currentlyMasked;

    const updatedSecrets = p.secrets.map((s) => ({ ...s, isMasked: newMaskState }));
    set({
      project: {
        ...p,
        secrets: updatedSecrets,
      },
    });
  },

  toggleSectionVisibility: (sectionId) => {
    const p = get().project;
    if (!p) return;

    function toggleRecursive(secs: DocumentationSection[]): DocumentationSection[] {
      return secs.map((sec) => {
        if (sec.id === sectionId) {
          return { ...sec, hidden: !sec.hidden };
        }
        if (sec.children) {
          return { ...sec, children: toggleRecursive(sec.children) };
        }
        return sec;
      });
    }

    set({
      project: {
        ...p,
        sections: toggleRecursive(p.sections),
      },
    });
  },

  reorderSections: (newSections) => {
    const p = get().project;
    if (!p) return;
    set({
      project: {
        ...p,
        sections: newSections,
      },
    });
  },

  resetProject: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      project: null,
      activeView: 'landing',
      selectedSectionId: null,
    });
  },
}));

