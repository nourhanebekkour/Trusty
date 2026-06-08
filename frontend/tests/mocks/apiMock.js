import { vi } from 'vitest'

// ═══════════════════════════════════════════════════════════════════════════
// MOCK CENTRALISÉ — module api (axios wrapper)
// Analogue du prismaMock.js du backend
//
// Le module api est la frontière HTTP du frontend, équivalent de Prisma
// pour le backend. Toujours mocké en tests unitaires, jamais en intégration.
//
// USAGE dans un fichier de test unitaire :
//
//   vi.mock('@/api', () => ({ default: apiMock }))
//   import api from '@/api'   ← api === apiMock, toutes les fn sont vi.fn()
//   beforeEach(() => vi.clearAllMocks())
//
// Note Vitest : vi.mock() est hissé avant les imports (hoisting).
// Utiliser le pattern inline ci-dessous pour éviter les problèmes de portée.
// ═══════════════════════════════════════════════════════════════════════════

export const apiMock = {
  get:    vi.fn(),
  post:   vi.fn(),
  put:    vi.fn(),
  delete: vi.fn(),
}
