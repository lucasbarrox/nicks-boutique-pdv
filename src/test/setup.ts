import { vi } from 'vitest';

// Mock do Sonner (Toast) para evitar erros em testes que não têm DOM real completo
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));