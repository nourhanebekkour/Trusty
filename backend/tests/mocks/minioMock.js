import { jest } from '@jest/globals';

export const mockMinio = {
    getFileUrl: jest.fn(),
    uploadAndSaveFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileStream: jest.fn(),
    getFileInfo: jest.fn(),
};
