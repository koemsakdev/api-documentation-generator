import { create } from 'zustand';
import {
  DocumentationProject,
  DocumentationSection,
  DocumentationTheme,
  Endpoint,
  ProjectMetadata,
} from '@/lib/types/documentation';
import { samplePostmanCollection } from '../sample/sample-collection';
import { normalizePostmanCollection } from '../postman/normalizer';
import { calculateQualityReport } from '../postman/quality';

interface DocumentationStore {
  project: DocumentationProject | null;
  activeView: 'landing' | 'overview' | 'workspace' | 'preview';
  workspaceViewMode: 'split' | 'editor-only' | 'doc-only';
  selectedSectionId: string | null;
  isThemeDrawerOpen: boolean;
  isExportDialogOpen: boolean;
  isSecretsModalOpen: boolean;
  searchQuery: string;

  // Actions
  setProject: (project: DocumentationProject) => void;
  loadSampleProject: () => void;
  setActiveView: (view: 'landing' | 'overview' | 'workspace' | 'preview') => void;
  setWorkspaceViewMode: (mode: 'split' | 'editor-only' | 'doc-only') => void;
  setSelectedSectionId: (id: string | null) => void;
  setThemeDrawerOpen: (open: boolean) => void;
  setExportDialogOpen: (open: boolean) => void;
  setSecretsModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  updateMetadata: (meta: Partial<ProjectMetadata>) => void;
  updateTheme: (theme: Partial<DocumentationTheme>) => void;
  updateSection: (sectionId: string, updates: Partial<DocumentationSection>) => void;
  updateEndpoint: (sectionId: string, endpointUpdates: Partial<Endpoint>) => void;
  toggleMaskSecrets: () => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (newSections: DocumentationSection[]) => void;
  resetProject: () => void;
}

const STORAGE_KEY = 'api_doc_project_state_v4';

// Initialize default sample project with authentic Postman theme & Google Sans
const defaultSampleProject = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });

// Find the first endpoint (e.g. User Login / Refresh Token)
let initialEndpointId: string | null = null;
for (const sec of defaultSampleProject.sections) {
  if (sec.type === 'endpoint') {
    initialEndpointId = sec.id;
    break;
  }
  if (sec.children && sec.children.length > 0) {
    const childEp = sec.children.find((c) => c.type === 'endpoint');
    if (childEp) {
      initialEndpointId = childEp.id;
      break;
    }
  }
}
if (!initialEndpointId) {
  initialEndpointId = defaultSampleProject.sections[2]?.id || defaultSampleProject.sections[0]?.id;
}

export const useDocumentationStore = create<DocumentationStore>((set, get) => ({
  project: defaultSampleProject,
  activeView: 'workspace', // Immediately show workspace so user sees results instantly
  workspaceViewMode: 'split',
  selectedSectionId: initialEndpointId,
  isThemeDrawerOpen: false,
  isExportDialogOpen: false,
  isSecretsModalOpen: false,
  searchQuery: '',

  setProject: (project: DocumentationProject) => {
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
      activeView: 'workspace',
      selectedSectionId: project.sections[2]?.id || project.sections[0]?.id || null,
    });
  },

  loadSampleProject: () => {
    const project = normalizePostmanCollection(samplePostmanCollection, { maskSecrets: true });
    set({
      project,
      activeView: 'workspace',
      selectedSectionId: initialEndpointId,
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
    set({ project: updatedProject });
  },

  updateEndpoint: (sectionId, endpointUpdates) => {
    const p = get().project;
    if (!p) return;

    function updateEpRecursive(secs: DocumentationSection[]): DocumentationSection[] {
      return secs.map((sec) => {
        if (sec.id === sectionId && sec.endpoint) {
          const updatedEndpoint = { ...sec.endpoint, ...endpointUpdates };
          return {
            ...sec,
            title: updatedEndpoint.name || sec.title,
            endpoint: updatedEndpoint,
          };
        }
        if (sec.children) {
          return { ...sec, children: updateEpRecursive(sec.children) };
        }
        return sec;
      });
    }

    const updatedSections = updateEpRecursive(p.sections);
    set({
      project: {
        ...p,
        sections: updatedSections,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  toggleMaskSecrets: () => {
    const p = get().project;
    if (!p) return;
    const anyMasked = p.secrets.some((s) => s.isMasked);
    const newMaskState = !anyMasked;

    const updatedSecrets = p.secrets.map((s) => ({ ...s, isMasked: newMaskState }));
    set({
      project: {
        ...p,
        secrets: updatedSecrets,
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
      },
    });
  },

  resetProject: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
    set({
      project: null,
      activeView: 'landing',
      selectedSectionId: null,
    });
  },
}));
