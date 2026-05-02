import { jest } from '@jest/globals';

export const mockPrisma = {
    etudiant: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
    },
    utilisateur: {
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    }
};