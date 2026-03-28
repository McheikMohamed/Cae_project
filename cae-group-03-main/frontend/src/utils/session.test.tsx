import { describe, expect, beforeEach, test } from 'vitest';
import {
  storeAuthenticatedUser,
  getAuthenticatedUser,
  clearAuthenticatedUser,
} from './session';
import { AuthenticatedUser } from '../types';

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('session.ts', () => {
  const mockUser: AuthenticatedUser = {
    email: 'test@example.com',
    firstName: 'John',
    role: 'CLIENT',
    token: 'mock-token',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  test('should store the authenticated user in localStorage when rememberMe is true', () => {
    storeAuthenticatedUser(mockUser, true);

    const storedUser = localStorage.getItem('authenticatedUser');
    expect(storedUser).not.toBeNull();
    expect(JSON.parse(storedUser!)).toEqual(mockUser);
  });

  test('should not store the authenticated user in localStorage when rememberMe is false', () => {
    storeAuthenticatedUser(mockUser, false);

    const storedUser = localStorage.getItem('authenticatedUser');
    expect(storedUser).toBeNull();
  });

  test('should retrieve the authenticated user from localStorage', () => {
    localStorage.setItem('authenticatedUser', JSON.stringify(mockUser));

    const retrievedUser = getAuthenticatedUser();
    expect(retrievedUser).toEqual(mockUser);
  });

  test('should return undefined if no authenticated user is stored in localStorage', () => {
    const retrievedUser = getAuthenticatedUser();
    expect(retrievedUser).toBeUndefined();
  });

  test('should clear the authenticated user from localStorage', () => {
    localStorage.setItem('authenticatedUser', JSON.stringify(mockUser));

    clearAuthenticatedUser();

    const storedUser = localStorage.getItem('authenticatedUser');
    expect(storedUser).toBeNull();
  });
});
