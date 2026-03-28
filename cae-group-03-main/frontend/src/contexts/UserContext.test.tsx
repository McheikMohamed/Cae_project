import { describe, expect, beforeEach, test } from 'vitest';
import { vi, Mock } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { UserContext, UserContextProvider } from './UserContext';
import { useContext } from 'react';
import { getAuthenticatedUser, storeAuthenticatedUser } from '../utils/session';
import { fetchProfile } from '../services/userApi';

// Mock for sessions
vi.mock('../utils/session');
// Mock for userApi fetchProfile only
vi.mock('../services/userApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/userApi')>();
  return {
    ...actual,
    fetchProfile: vi.fn(),
  };
});
// Mock de fetch
global.fetch = vi.fn();

const TestComponent = () => {
  const {
    authenticatedUser,
    registerUser,
    loginUser,
    clearUser,
    updateToken,
    profilUser,
    updatePassword,
  } = useContext(UserContext);

  return (
    <div>
      <button
        onClick={() =>
          registerUser({
            email: '',
            password: '',
            honorific: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            role: '',
            company: '',
            address: {
              street: '',
              number: '',
              box: '',
              postalCode: '',
              city: '',
              country: {
                name: '',
              },
            },
          })
        }
      >
        Register
      </button>
      <button
        onClick={() =>
          loginUser({
            email: 'test@test.com',
            password: '1234',
            StayConnected: false,
          })
        }
      >
        Login
      </button>
      <button onClick={clearUser}>Se déconnecter</button>
      <button onClick={() => updateToken()}>Update Token</button>
      <button
        onClick={() =>
          profilUser({
            token: '123',
            honorific: '',
            lastName: '',
            firstName: '',
            phoneNumber: '',
            email: '',
            password: '',
            role: '',
            address: {
              street: '',
              number: '',
              box: '',
              postalCode: '',
              city: '',
              country: {
                name: '',
              },
            },
          })
        }
      >
        Get Profile
      </button>
      <button
        onClick={() =>
          updatePassword({
            oldPassword: '123',
            newPassword: '456',
            confirmPassword: '456',
          })
        }
      >
        Update Password
      </button>
      <div>{authenticatedUser ? 'Logged In' : 'Not Logged In'}</div>
    </div>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should initialize with no authenticated user', () => {
    const { getByText } = render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>,
    );

    expect(getByText('Not Logged In')).toBeTruthy();
  });

  test('should call registerUser and handle success', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: vi.fn(),
    });

    const { getByText } = render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>,
    );

    const registerButton = getByText('Register');
    registerButton.click();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/auths/register',
        expect.any(Object),
      );
    });
  });

  test('should call loginUser and set authenticated user', async () => {
    const mockUser = { email: 'test@test.com', token: 'mock-token' };
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: vi.fn(() => mockUser),
    });

    const { getByText } = render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>,
    );

    const loginButton = getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/auths/login',
        expect.any(Object),
      );
      expect(getByText('Logged In')).toBeTruthy();
    });
  });

  test('should clear the authenticated user', () => {
    const { getByText } = render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>,
    );

    const clearButton = getByText('Se déconnecter');
    clearButton.click();

    expect(getByText('Not Logged In')).toBeTruthy();
  });

  test('Should update token of authenticatedUser', async () => {
    const mockOldToken = 'ancien-token';
    const mockNewToken = 'nouveau-token';

    (getAuthenticatedUser as Mock).mockReturnValue({
      email: 'test@example.com',
      token: mockOldToken,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: mockNewToken }),
    });

    const { getByText } = render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>,
    );

    getByText('Update Token').click();

    await waitFor(() => {
      expect(storeAuthenticatedUser).toHaveBeenCalledWith(
        expect.objectContaining({ token: mockNewToken }),
        true,
      );
    });
  });

  test('should fetch and set user profile', async () => {
    const mockToken = 'mock-token';
    const mockProfile = {
      token: mockToken,
      honorific: 'Mr.',
      lastName: 'Doe',
      firstName: 'John',
      phoneNumber: '123456789',
      email: 'john.doe@example.com',
      password: '',
      role: 'user',
      address: {
        street: 'Main St',
        number: '123',
        box: '',
        postalCode: '1000',
        city: 'Brussels',
        country: {
          name: 'Belgium',
        },
      },
    };

    (getAuthenticatedUser as Mock).mockReturnValue({
      email: 'john.doe@example.com',
      token: mockToken,
    });

    (fetchProfile as Mock).mockResolvedValueOnce(mockProfile);

    const { getByText } = render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>,
    );

    const getProfileButton = getByText('Get Profile');
    getProfileButton.click();

    await waitFor(() => {
      expect(fetchProfile).toHaveBeenCalledWith('mock-token');
    });
  });

  test('should call updatePassword API with correct data', async () => {
    const mockToken = 'mock-token';

    (getAuthenticatedUser as Mock).mockReturnValue({
      email: 'john.doe@example.com',
      token: mockToken,
    });

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: vi.fn(),
    });

    const { getByText } = render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>,
    );

    const updatePasswordButton = getByText('Update Password');
    updatePasswordButton.click();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/auths/updatePassword',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: mockToken,
          }),
        }),
      );
    });
  });
});
