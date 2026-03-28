import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import NavBar from './index';
import { UserContext } from '../../contexts/UserContext';
import { BatchContext } from '../../contexts/BatchContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const navigateMock = vi.fn();
const mockBatchContextValue = {
  batchs: [],
  setBatchs: vi.fn(),
  addToCart: vi.fn(),
  getCart: vi.fn(),
  clearCart: vi.fn(),
  addBatch: vi.fn(),
  cart: [],
  products: [],
  setProducts: vi.fn(),
  getBatch: vi.fn(),
  reserveCart: vi.fn(),
  setCart: vi.fn(),
  batch: undefined,
  removeFromCart: vi.fn(),
  fetchCart: vi.fn(),
  getBatchSellData: vi.fn(),
  getUserReservations: vi.fn(),
  getReservationLines: vi.fn(),
  cancelReservation: vi.fn(),
  updateCartQuantity: vi.fn(),
  updateBatch: vi.fn(),
  rejectBatch: vi.fn(),
  acceptBatch: vi.fn(),
  createProductType: vi.fn(),
  fetchProductTypes: vi.fn(),
  productTypes: [],
  getReservation: vi.fn(),
  changeStatusAsRetrieved: vi.fn(),
  changeStatusAsAbandoned: vi.fn(),
  getBatchSellDataYear: vi.fn(),
  updateProductType: vi.fn(),
  updateBatchImage: vi.fn(),
  fetchImagesByProductName: vi.fn(),
  freeSale: vi.fn(),
  addRemovedQuantity: vi.fn(),
  subRemovedQuantity: vi.fn(),
  emptyCart: vi.fn(),
};

const createContext = (userOverride = {}) => ({
  authenticatedUser: undefined,
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  updateToken: vi.fn(),
  profilUser: vi.fn(),
  updatePassword: vi.fn(),
  user: undefined,
  ...userOverride,
});

describe('NavBar', () => {
  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    navigateMock.mockClear();
  });

  test('renders logo and navigates to home', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={createContext()}>
          <BatchContext.Provider value={mockBatchContextValue}>
            <NavBar />
          </BatchContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const logo = screen.getByText('Terroir & Cie');
    fireEvent.click(logo);
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  test('shows login/register when not authenticated', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={createContext()}>
          <BatchContext.Provider value={mockBatchContextValue}>
            <NavBar />
          </BatchContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /S'inscrire/i })).toBeTruthy();
  });

  test('shows greeting when user is authenticated', () => {
    const user = { firstName: 'Alice', role: 'CLIENT', token: '', email: '' };
    render(
      <MemoryRouter>
        <UserContext.Provider
          value={createContext({ authenticatedUser: user })}
        >
          <BatchContext.Provider value={mockBatchContextValue}>
            <NavBar />
          </BatchContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Bonjour, Alice/i)).toBeTruthy();
  });

  test('displays role-based buttons for PRODUCER', () => {
    const user = { firstName: 'Prod', role: 'PRODUCER', token: '', email: '' };
    render(
      <MemoryRouter>
        <UserContext.Provider
          value={createContext({ authenticatedUser: user })}
        >
          <BatchContext.Provider value={mockBatchContextValue}>
            <NavBar />
          </BatchContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /Créer un lot/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Mes lots/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Profil/i })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Se déconnecter/i }),
    ).toBeTruthy();
  });

  test('displays role-based buttons for MANAGER', () => {
    const user = { firstName: 'Boss', role: 'MANAGER', token: '', email: '' };
    render(
      <MemoryRouter>
        <UserContext.Provider
          value={createContext({ authenticatedUser: user })}
        >
          <BatchContext.Provider value={mockBatchContextValue}>
            <NavBar />
          </BatchContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: /Ajouter un Compte/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Tableau de bord/i }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /Profil/i })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Se déconnecter/i }),
    ).toBeTruthy();
  });

  test('displays role-based buttons for DEVELOPER', () => {
    const user = { firstName: 'Dev', role: 'DEVELOPER', token: '', email: '' };
    render(
      <MemoryRouter>
        <UserContext.Provider
          value={createContext({ authenticatedUser: user })}
        >
          <BatchContext.Provider value={mockBatchContextValue}>
            <NavBar />
          </BatchContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /Créer un lot/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Mes lots/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Panier/i })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Ajouter un Compte/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Tableau de bord/i }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /Profil/i })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Se déconnecter/i }),
    ).toBeTruthy();
  });

  test('logout clears user and cart and navigates to login', () => {
    const clearUserMock = vi.fn();
    const setCartMock = vi.fn();
    const user = { firstName: 'User', role: 'CLIENT', token: '', email: '' };

    render(
      <MemoryRouter>
        <UserContext.Provider
          value={createContext({
            authenticatedUser: user,
            clearUser: clearUserMock,
          })}
        >
          <BatchContext.Provider
            value={{ ...mockBatchContextValue, setCart: setCartMock }}
          >
            <NavBar />
          </BatchContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const logoutButton = screen.getByRole('button', {
      name: /Se déconnecter/i,
    });
    fireEvent.click(logoutButton);

    expect(clearUserMock).toHaveBeenCalled();
    expect(setCartMock).toHaveBeenCalledWith([]);
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
