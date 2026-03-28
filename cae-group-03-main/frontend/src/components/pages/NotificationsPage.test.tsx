import { describe, test, vi, beforeEach, expect, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationsPage from './NotificationsPage';
import { UserContext } from '../../contexts/UserContext';
import { BatchContext } from '../../contexts/BatchContext';
import * as notificationApi from '../../services/notificationApi';

describe('NotificationsPage', () => {
  const mockUser = {
    email: 'test@example.com',
    token: 'mock-token',
    firstName: 'Test',
    role: 'user', // Adjust the role as per your application's requirements
  };

  const mockBatchs = [
    {
      idBatch: 1,
      pricePerUnit: 10,
      product: {
        idProduct: 1,
        name: 'Pommes',
        description: 'Fruits bio',
        productType: { libelle: 'Fruits' },
        unit: { name: 'kg' },
      },
      receiptDate: new Date(),
      quantity: 6,
      producer: {
        email: 'test2@example.com',
        password: 'password123',
        role: 'producer',
        firstName: 'Doe',
        company: 'Unknown Company',
        token: 'mock-token',
      },
      status: 'available',
    },
  ];

  const mockContextValue = {
    batchs: mockBatchs,
    setBatchs: vi.fn(),
    addToCart: vi.fn(),
    clearCart: vi.fn(),
    addBatch: vi.fn(),
    cart: [],
    products: [],
    setProducts: vi.fn(),
    getBatch: vi.fn(),
    batch: undefined,
    setCart: vi.fn(),
    reserveCart: vi.fn(),
    removeFromCart: vi.fn(),
    fetchCart: vi.fn(),
    getUserReservations: vi.fn(),
    getReservationLines: vi.fn(),
    cancelReservation: vi.fn(),
    updateBatch: vi.fn(),
    rejectBatch: vi.fn(),
    acceptBatch: vi.fn(),
    getBatchSellData: vi.fn(),
    updateCartQuantity: vi.fn(),
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

  const mockUserContextValue = {
    authenticatedUser: mockUser,
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    registerAdministrator: vi.fn(),
    clearUser: vi.fn(),
    updateToken: vi.fn(),
    profilUser: vi.fn(),
    updatePassword: vi.fn(),
    user: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  vi.mock('../../services/notificationApi', async () => {
    const actual = await vi.importActual<typeof notificationApi>(
      '../../services/notificationApi',
    );
    return {
      ...actual,
      fetchNotificationsAPI: vi.fn(),
    };
  });

  const renderComponent = () => {
    return render(
      <UserContext.Provider value={mockUserContextValue}>
        <BatchContext.Provider value={mockContextValue}>
          <MemoryRouter>
            <NotificationsPage />
          </MemoryRouter>
        </BatchContext.Provider>
      </UserContext.Provider>,
    );
  };

  test('Should render loader while fetching', () => {
    (notificationApi.fetchNotificationsAPI as Mock).mockReturnValue(
      new Promise(() => {}),
    );

    renderComponent();

    expect(screen.getByRole('progressbar')).not.toBeNull();
  });

  test('Should show fallback when no notifications', async () => {
    (notificationApi.fetchNotificationsAPI as Mock).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Aucune notification disponible.'),
      ).not.toBeNull();
    });
  });

  test('Should show "Lot introuvable" when batch is not found', async () => {
    (notificationApi.fetchNotificationsAPI as Mock).mockResolvedValue([
      {
        id: 'notif-2',
        message: 'Lot introuvable',
        batchId: 'unknown',
        date: new Date().toISOString(),
      },
    ]);

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <BatchContext.Provider
          value={{
            batchs: [],
            setBatchs: vi.fn(),
            addToCart: vi.fn(),
            addBatch: vi.fn(),
            cart: [],
            products: [],
            setProducts: vi.fn(),
            getBatch: vi.fn(),
            batch: undefined,
            setCart: vi.fn(),
            reserveCart: vi.fn(),
            removeFromCart: vi.fn(),
            fetchCart: vi.fn(),
            getUserReservations: vi.fn(),
            getReservationLines: vi.fn(),
            cancelReservation: vi.fn(),
            updateBatch: vi.fn(),
            rejectBatch: vi.fn(),
            acceptBatch: vi.fn(),
            getBatchSellData: vi.fn(),
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
          }}
        >
          <MemoryRouter>
            <NotificationsPage />
          </MemoryRouter>
        </BatchContext.Provider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      const elements = screen.getAllByText('Lot introuvable');
      expect(elements).toHaveLength(2); // Verify there is 2 elements with this text
    });
  });
});
