import { describe, expect, vi, beforeEach, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import Profile from './ProfilePage';

// Mock de `useNavigate`
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render an error if user is disconnected', async () => {
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      registerAdministrator: vi.fn(),
      clearUser: vi.fn(),
      updateToken: vi.fn(),
      profilUser: vi.fn(),
      updatePassword: vi.fn(),
      user: undefined,
    };
    render(
      <UserContext.Provider value={mockContextValue}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'Utilisateur non authentifié. Veuillez vous connecter.',
        ),
      ).not.toBeNull();
    });
  });

  test('should render user information when logged in', async () => {
    const mockUser = {
      honorific: 'M.',
      firstName: 'testNom',
      lastName: 'testPrenom',
      email: 'test@example.com',
      phoneNumber: '123456789',
      address: {
        street: 'testRue',
        number: '10',
        box: '1',
        postalCode: '75000',
        city: 'testVille',
        country: { name: 'Belgique' },
      },
      token: 'mockToken',
      password: 'mockPassword*1',
      role: 'user',
    };
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      registerAdministrator: vi.fn(),
      clearUser: vi.fn(),
      updateToken: vi.fn(),
      profilUser: vi.fn(),
      updatePassword: vi.fn(),
      user: mockUser,
    };

    render(
      <UserContext.Provider value={mockContextValue}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </UserContext.Provider>,
    );

    expect(screen.getByText('M. testNom testPrenom')).not.toBeNull();
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('123456789')).not.toBeNull();
    expect(
      screen.getByText(
        (content) => content.includes('testRue') && content.includes('10'),
      ),
    ).not.toBeNull();
    expect(screen.getByText('75000 testVille, Belgique')).not.toBeNull();
  });
});
