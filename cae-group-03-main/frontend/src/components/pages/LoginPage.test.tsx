import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import LoginPage from '../../components/pages/LoginPage';
import { UserContext } from '../../contexts/UserContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LoginPage', () => {
  test('renders a form with username and password inputs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i, {
      selector: 'input',
    });
    const remberMeCheckbox = screen.getByLabelText(/rester connecté/i);

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(remberMeCheckbox).toBeTruthy();
  });

  test('calls loginUser (CLIENT) and navigates to HomePage when the form is submitted', async () => {
    const loginUserMock = vi.fn().mockResolvedValue({
      email: 'testuser',
      role: 'CLIENT',
      token: 'mock-token',
    });
    const navigateMock = vi.fn();
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: loginUserMock,
      registerAdministrator: vi.fn(),
      clearUser: vi.fn(),
      updateToken: vi.fn(),
      profilUser: vi.fn(),
      updatePassword: vi.fn(),
      user: undefined,
    };

    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i, {
      selector: 'input',
    });
    const remberMeCheckbox = screen.getByLabelText(/rester connecté/i);
    const submitButton = screen.getByRole('button', {
      name: /confirmer/i,
    });

    fireEvent.change(emailInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(remberMeCheckbox);
    fireEvent.click(submitButton);

    expect(loginUserMock).toHaveBeenCalledWith({
      email: 'testuser',
      password: 'password',
      StayConnected: true,
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  test('calls console.error when loginUser throws an error', async () => {
    const loginUserMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Login failed'));
    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      registerAdministrator: vi.fn(),
      loginUser: loginUserMock,
      clearUser: vi.fn(),
      updateToken: vi.fn(),
      profilUser: vi.fn(),
      updatePassword: vi.fn(),
      user: undefined,
    };

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <LoginPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i, {
      selector: 'input',
    });
    const remberMeCheckbox = screen.getByLabelText(/rester connecté/i);
    const submitButton = screen.getByRole('button', {
      name: /confirmer/i,
    });

    fireEvent.change(emailInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(remberMeCheckbox, { target: { checked: false } });
    fireEvent.click(submitButton);

    expect(loginUserMock).toHaveBeenCalledWith({
      email: 'testuser',
      password: 'password',
      StayConnected: true,
    });

    // Verify that console.error was called
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'LoginPage::error: ',
        expect.any(Error),
      );
    });

    consoleErrorMock.mockRestore();
  });
});
