import {
  render,
  screen,
  fireEvent /* waitFor */,
} from '@testing-library/react';
import { describe, expect, vi, test } from 'vitest';
import {
  MemoryRouter,
  Routes,
  Route,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import CreateBatchPage from './CreateBatchPage';
import { BatchContextType } from '../../types';

// On mock useNavigate pour pouvoir contrôler la navigation dans les tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// On crée un contexte de test pour ProjectContext

const testBatchContext: BatchContextType = {
  addBatch: vi.fn().mockResolvedValue(undefined),
  batchs: [],
  setBatchs: () => {},
  addToCart: vi.fn(),
  cart: [],
  products: [],
  setProducts: () => {},
  setCart: vi.fn(),
  getBatch: vi.fn(),
  batch: undefined,
  reserveCart: vi.fn(),
  removeFromCart: vi.fn(),
  fetchCart: vi.fn(),
  updateBatch: vi.fn(),
  rejectBatch: vi.fn(),
  acceptBatch: vi.fn(),
  getBatchSellData: vi.fn(),
  getUserReservations: vi.fn(),
  getReservationLines: vi.fn(),
  cancelReservation: vi.fn(),
  updateCartQuantity: vi.fn(),
  createProductType: vi.fn(),
  fetchProductTypes: vi.fn(),
  productTypes: [],
  getReservation: vi.fn(),
  changeStatusAsRetrieved: vi.fn(),
  changeStatusAsAbandoned: vi.fn(),
  getBatchSellDataYear: vi.fn(),
  updateProductType: vi.fn(),
  freeSale: vi.fn(),
  updateBatchImage: vi.fn(),
  fetchImagesByProductName: vi.fn(),
  addRemovedQuantity: vi.fn(),
  subRemovedQuantity: vi.fn(),
  emptyCart: vi.fn(),
};

// Composant wrapper qui fournit le contexte via Outlet
const TestOutletProvider = ({ context }: { context: BatchContextType }) => (
  <Routes>
    <Route path="/" element={<Outlet context={context} />}>
      <Route path="create-batch" element={<CreateBatchPage />} />
    </Route>
  </Routes>
);

describe('CreateBatchPage', () => {
  /* test('should render the form and submit successfully when all fields are valid', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    // On fournit un UserContext complet (ici, avec une authentification valide)
    const mockUserContextValue = {
      authenticatedUser: {
        token: 'test-token',
        email: 'test@test.com',
        firstName: 'Test',
        role: 'PROducer',
      },
      registerUser: vi.fn(),
      registerAdministrator: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      updateToken: vi.fn(),
      profilUser: vi.fn(),
      updatePassword: vi.fn(),
      user: undefined,
    };

    render(
      <MemoryRouter initialEntries={['/create-batch']}>
        <UserContext.Provider value={mockUserContextValue}>
          <TestOutletProvider context={testBatchContext} />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Nom du produit/i), {
      target: { value: 'Tomates' },
    });
    fireEvent.mouseDown(screen.getByLabelText(/Type/i));
    fireEvent.click(await screen.findByRole('option', { name: 'Fruits' }));
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Tomates fraîches et bio' },
    });
    fireEvent.mouseDown(screen.getByLabelText(/^Unité/i));
    fireEvent.click(await screen.findByRole('option', { name: 'Kilo' }));
    fireEvent.change(screen.getByLabelText(/Date de disponibilité/i), {
      target: { value: '2025-03-30' },
    });
    fireEvent.change(screen.getByLabelText(/Quantité disponible/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/Prix par unité/i), {
      target: { value: '5' },
    });

    const submitButton = screen.getByRole('button', {
      name: /Proposer le lot/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  }); */

  test('should display error messages when required fields are missing', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    const mockUserContextValue = {
      authenticatedUser: {
        token: 'test-token',
        email: 'test@test.com',
        firstName: 'Test',
        company: 'Test Company',
        role: 'PRODUCER',
      },
      registerUser: vi.fn(),
      registerAdministrator: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      updateToken: vi.fn(),
      profilUser: vi.fn(),
      updatePassword: vi.fn(),
      user: undefined,
    };

    render(
      <MemoryRouter initialEntries={['/create-batch']}>
        <UserContext.Provider value={mockUserContextValue}>
          <TestOutletProvider context={testBatchContext} />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    // submit form without filling any fields
    const submitButton = screen.getByRole('button', {
      name: /Proposer le lot/i,
    });
    fireEvent.click(submitButton);

    expect(screen.queryByText(/Nom requis/i)).not.toBeNull();
    expect(screen.queryByText(/Type requis/i)).not.toBeNull();
    expect(screen.queryByText(/Description requise/i)).not.toBeNull();
    expect(screen.queryByText(/Unité requise/i)).not.toBeNull();
    expect(
      screen.queryByText(/La date doit être dans au moins 3 jours./i),
    ).not.toBeNull();
    expect(screen.queryByText(/Quantité requise/i)).not.toBeNull();
    expect(screen.queryByText(/Prix requis/i)).not.toBeNull();

    // verify that navigate was not called
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
