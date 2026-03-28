import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, vi, test } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import RegisterPage from './RegisterPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('RegisterPage', () => {
  test('should render the registration form and navigates to LoginPage when the form is submitted', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    const registerUserMock = vi.fn();
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: registerUserMock,
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      updateToken: vi.fn(),
      profilUser: vi.fn(),
      updatePassword: vi.fn(),
      user: undefined,
    };
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const civilityInput = screen.getByLabelText(/Civilité/i);
    const lastNameInput = screen.getByLabelText(/^Nom$/i);
    const firstNameInput = screen.getByLabelText(/^Prenom$/i);
    const streetInput = screen.getByLabelText(/Rue/i);
    const number = screen.getByLabelText(/^Numero$/i);
    const box = screen.getByLabelText(/Boite/i);
    const postalCodeInput = screen.getByLabelText(/Code postal/i);
    const cityInput = screen.getByLabelText(/Ville/i);
    const countryInput = screen.getByLabelText(/Pays/i);
    const phoneNumberInput = screen.getByLabelText(/^Numero de telephone$/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Mot de passe$/i);
    const confirmPasswordInput = screen.getByLabelText(
      /^Confirmer le mot de passe$/i,
    );
    const submitButton = screen.getByRole('button', {
      name: /Confirmer/i,
    });

    fireEvent.mouseDown(civilityInput);
    const civilityOption = await screen.findByRole('option', { name: 'M.' });
    fireEvent.click(civilityOption);

    fireEvent.change(lastNameInput, { target: { value: 'testNom' } });
    fireEvent.change(firstNameInput, { target: { value: 'testPrenom' } });
    fireEvent.change(streetInput, { target: { value: 'testRue' } });
    fireEvent.change(number, { target: { value: '1' } });
    fireEvent.change(box, { target: { value: '1' } });
    fireEvent.change(postalCodeInput, { target: { value: '456' } });
    fireEvent.change(cityInput, { target: { value: 'testVille' } });
    fireEvent.mouseDown(countryInput);
    const countryOption = await screen.findByRole('option', {
      name: 'Belgique',
    });
    fireEvent.click(countryOption);
    fireEvent.change(phoneNumberInput, { target: { value: '0489111111' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password1&' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password1&' } });

    fireEvent.click(submitButton);

    expect(registerUserMock).toHaveBeenCalledWith({
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
    });

    await vi.waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  }, 10000); // Timeout added to 10 secondes
});
