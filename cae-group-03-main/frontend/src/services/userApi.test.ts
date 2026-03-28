import {
  registerUser,
  loginUser,
  fetchProfile,
  updateUserPassword,
} from './userApi';
import { vi, describe, test, expect, beforeEach, Mock } from 'vitest';

global.fetch = vi.fn();

describe('userApi service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('registerUser sends POST request to /api/auths/register', async () => {
    (fetch as Mock).mockResolvedValue({ ok: true });

    const newUser = {
      honorific: 'M.',
      lastName: 'testNom',
      firstName: 'testPrenom',
      phoneNumber: '0489111111',
      email: 'test@example.com',
      password: 'Password1&',
      role: 'CLIENT',
      company: '',
      address: {
        street: 'testRue',
        number: '1',
        box: '1',
        postalCode: '456',
        city: 'testVille',
        country: {
          name: 'Belgique',
        },
      },
    };
    await registerUser(newUser);

    expect(fetch).toHaveBeenCalledWith(
      '/api/auths/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }),
    );
  });

  test('registerUser throws error if response not ok', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    await expect(
      registerUser({
        email: '',
        password: '',
        firstName: '',
        honorific: '',
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
      }),
    ).rejects.toThrow('fetch error : 400 : Bad Request');
  });

  test('loginUser sends POST request and returns data', async () => {
    const mockResponse = {
      token: 'abc',
      role: 'CLIENT',
      firstName: 'John',
      email: 'john@test.com',
    };
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await loginUser({
      email: 'john@test.com',
      password: 'secret',
      StayConnected: false,
    });
    expect(result).toEqual(mockResponse);
  });

  test('fetchProfile sends GET request with token', async () => {
    const token = 'Bearer xyz';
    const mockProfile = { email: 'john@test.com', firstName: 'John' };

    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const result = await fetchProfile(token);
    expect(fetch).toHaveBeenCalledWith(
      '/api/auths/account',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      }),
    );
    expect(result).toEqual(mockProfile);
  });

  test('updateUserPassword sends PATCH request with token and data', async () => {
    const token = 'Bearer abc';
    const data = {
      oldPassword: 'old',
      newPassword: 'new',
      confirmPassword: 'new',
    };

    (fetch as Mock).mockResolvedValue({ ok: true });

    await updateUserPassword(data, token);

    expect(fetch).toHaveBeenCalledWith(
      '/api/auths/updatePassword',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(data),
      }),
    );
  });

  test('updateUserPassword throws error if response not ok', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    await expect(
      updateUserPassword(
        {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
        'invalid-token',
      ),
    ).rejects.toThrow('fetch error : 403 : Forbidden');
  });
});
