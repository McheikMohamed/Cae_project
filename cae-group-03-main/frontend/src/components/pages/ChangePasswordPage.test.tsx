import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePassword from './ChangePasswordPage';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, beforeEach, expect, test } from 'vitest';
import { UserContext } from '../../contexts/UserContext';

describe('ChangePasswordPage', () => {
  const mockedUpdatePassword = vi.fn();
  const mockedAuthenticatedUser = {
    email: 'test@example.com',
    firstName: 'John',
    role: 'CLIENT',
    token: 'mock-token',
  };

  const mockContextValue = {
    authenticatedUser: mockedAuthenticatedUser,
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    registerAdministrator: vi.fn(),
    clearUser: vi.fn(),
    updateToken: vi.fn(),
    profilUser: vi.fn(),
    updatePassword: mockedUpdatePassword,
    user: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ChangePassword />
        </UserContext.Provider>
      </MemoryRouter>,
    );
  };

  test('renders all input fields and buttons', () => {
    renderComponent();
    expect(screen.getByLabelText(/^Ancien mot de passe$/i)).not.toBeNull();
    expect(screen.getByLabelText(/^Nouveau mot de passe$/i)).not.toBeNull();
    expect(
      screen.getByLabelText(/^Confirmer le nouveau mot de passe$/i),
    ).not.toBeNull();
    expect(
      screen.getByRole('button', { name: /Changer le mot de passe/i }),
    ).not.toBeNull();
    expect(
      screen.getByRole('button', { name: /Retour au profil/i }),
    ).not.toBeNull();
  });

  test('shows error if new password is weak', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/^Ancien mot de passe$/i), {
      target: { value: 'oldpass123!' },
    });

    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe$/i), {
      target: { value: 'weak' },
    });

    fireEvent.change(
      screen.getByLabelText(/Confirmer le nouveau mot de passe/i),
      {
        target: { value: 'weak' },
      },
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i }),
    );

    expect(
      await screen.findByText(
        /Le nouveau mot de passe doit contenir au moins 8 caractères/i,
      ),
    ).not.toBeNull();
  });

  test('shows error if passwords do not match', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe$/i), {
      target: { value: 'Strong@123' },
    });

    fireEvent.change(
      screen.getByLabelText(/^Confirmer le nouveau mot de passe$/i),
      {
        target: { value: 'Mismatch@123' },
      },
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i }),
    );

    expect(
      await screen.findByText(/Les mots de passe ne correspondent pas/i),
    ).not.toBeNull();
  });

  test('calls updatePassword on success', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/^Ancien mot de passe$/i), {
      target: { value: 'Old@1234' },
    });

    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe$/i), {
      target: { value: 'New@1234' },
    });

    fireEvent.change(
      screen.getByLabelText(/Confirmer le nouveau mot de passe/i),
      {
        target: { value: 'New@1234' },
      },
    );

    mockedUpdatePassword.mockResolvedValueOnce(undefined); // Mock de la réponse de l'API

    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i }),
    );

    // Attendre que le Snackbar apparaisse et vérifier son contenu
    await waitFor(() => {
      const successMessage = screen.queryByText(
        /Le mot de passe a été modifié avec succès/i,
      );
      expect(successMessage).not.toBeNull();
    });
  });

  test('shows old password error on failure', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/^Ancien mot de passe$/i), {
      target: { value: 'WrongOld@1234' },
    });

    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe$/i), {
      target: { value: 'Valid@1234' },
    });

    fireEvent.change(
      screen.getByLabelText(/^Confirmer le nouveau mot de passe$/i),
      {
        target: { value: 'Valid@1234' },
      },
    );

    mockedUpdatePassword.mockRejectedValueOnce(new Error('Unauthorized'));

    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i }),
    );

    expect(await screen.findByText(/Mot de passe incorrect/i)).not.toBeNull();
  });
});
