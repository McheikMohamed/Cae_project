import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, vi, test } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import RegisterPageAdmin from './RegisterPageAdmin';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('RegisterPageAdmin', () => {
  /*
  test('should render the registration form and navigate to Homepage when the form is submitted', async () => {
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
          <RegisterPageAdmin />
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
    const phoneNumberInput = screen.getByLabelText(/Numero de telephone/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const companyInput = screen.getByLabelText(/Entreprise/i);
    const roleInput = screen.getByLabelText(/Rôle/i);
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
    fireEvent.change(phoneNumberInput, { target: { value: '123456' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(companyInput, { target: { value: 'testCompany' } });
    fireEvent.mouseDown(roleInput);
    const roleOption = await screen.findByRole('option', {
      name: 'Gestionnaire',
    });
    fireEvent.click(roleOption);
    fireEvent.change(passwordInput, { target: { value: 'Password1&' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password1&' } });
    fireEvent.click(submitButton);

    expect(registerUserMock).toHaveBeenCalledWith({
      honorific: 'M.',
      lastName: 'testNom',
      firstName: 'testPrenom',
      phoneNumber: '123456',
      email: 'test@example.com',
      password: 'Password1&',
      role: 'MANAGER',
      company: 'testCompany',
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
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  }, 10000);
  */

  test('should not submit the form if required fields are missing', async () => {
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
          <RegisterPageAdmin />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', {
      name: /Confirmer/i,
    });

    // Do not fill in the required fields
    fireEvent.click(submitButton);

    // Verify that the function `registerUserMock` is not called
    expect(registerUserMock).not.toHaveBeenCalled();

    // Verify that error messages are displayed for required fields
    expect(
      screen.queryByText(/Veuillez sélectionner une civilité/i),
    ).not.toBeNull();
    expect(screen.queryByText(/Prénom requis/i)).not.toBeNull();
    expect(screen.queryByText(/Rue requise/i)).not.toBeNull();
    expect(screen.queryByText(/Numéro de téléphone requis/i)).not.toBeNull();
    expect(screen.queryByText(/Code postal requis/i)).not.toBeNull();
    expect(screen.queryByText(/Ville requise/i)).not.toBeNull();
    expect(screen.queryByText(/Numéro de téléphone requis/i)).not.toBeNull();
    expect(screen.queryByText(/Email requis/i)).not.toBeNull();
    expect(screen.queryByText(/Veuillez sélectionner un rôle/i)).not.toBeNull();
    expect(
      screen.queryByText(
        /Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial./i,
      ),
    ).not.toBeNull();
    expect(screen.queryByText(/Confirmation requise/i)).not.toBeNull();
  });
});
