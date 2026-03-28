import { describe, expect, vi, beforeEach, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BatchContext } from '../../contexts/BatchContext';
import { UserContext } from '../../contexts/UserContext';
import BatchHistoryPage from './BatchHistoryPage';

describe('BatchHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should display error if not autheticated', () => {
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
      <BatchContext.Provider value={mockBatchContextValue}>
        <UserContext.Provider value={mockUserContextValue}>
          <MemoryRouter>
            <BatchHistoryPage />
          </MemoryRouter>
        </UserContext.Provider>
      </BatchContext.Provider>,
    );

    expect(
      screen.getByText('Veuillez vous connecter pour voir vos lots.'),
    ).not.toBeNull();
  });

  test('Should display batches to sell', () => {
    const mockBatch = [
      {
        idBatch: 1,
        pricePerUnit: 10,
        status: 'available',
        product: {
          idProduct: 1,
          name: 'Pomme',
          description: 'Fruits bio',
          productType: { libelle: 'Fruits' },
          unit: { name: 'kg' },
        },
        receiptDate: new Date(),
        quantity: 6,
        producer: {
          email: 'test@example.com',
          password: 'password123',
          role: 'producer',
          firstName: 'Doe',
          company: 'Doe Company',
          token: 'mock-token',
        },
      },
    ];

    const mockBatchContextValue = {
      batchs: mockBatch,
      setBatchs: vi.fn(),
      addToCart: vi.fn(),
      getCart: vi.fn(),
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
      rejectBatch: vi.fn(),
      acceptBatch: vi.fn(),
      updateBatch: vi.fn(),
      getBatchSellData: vi.fn(),
      getBatchSellDataYear: vi.fn(),
      updateCartQuantity: vi.fn(),
      createProductType: vi.fn(),
      fetchProductTypes: vi.fn(),
      productTypes: [],
      getReservation: vi.fn(),
      changeStatusAsRetrieved: vi.fn(),
      changeStatusAsAbandoned: vi.fn(),
      updateProductType: vi.fn(),
      updateBatchImage: vi.fn(),
      fetchImagesByProductName: vi.fn(),
      freeSale: vi.fn(),
      addRemovedQuantity: vi.fn(),
      subRemovedQuantity: vi.fn(),
      emptyCart: vi.fn(),
    };

    const mockUserContextValue = {
      authenticatedUser: {
        email: 'test@example.com',
        firstName: 'Doe',
        role: 'PRODUCER',
        token: 'mock-token',
      },
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
      <BatchContext.Provider value={mockBatchContextValue}>
        <UserContext.Provider value={mockUserContextValue}>
          <MemoryRouter>
            <BatchHistoryPage />
          </MemoryRouter>
        </UserContext.Provider>
      </BatchContext.Provider>,
    );

    expect(screen.getByText('Historique des lots')).not.toBeNull();
    expect(screen.getByText('Lots en vente actuellement')).not.toBeNull();
    expect(screen.getByText('Pomme')).not.toBeNull();
  });

  test('Should display old batches', () => {
    const mockBatch = [
      {
        idBatch: 2,
        pricePerUnit: 20,
        status: 'removed',
        product: {
          idProduct: 2,
          name: 'Carottes',
          description: 'Légumes frais',
          productType: { libelle: 'Légumes' },
          unit: { name: 'kg' },
        },
        receiptDate: new Date(),
        quantity: 5,
        producer: {
          email: 'test@example.com',
          password: 'password123',
          role: 'producer',
          firstName: 'John',
          company: 'Doe Company',
          token: 'mock-token',
        },
      },
    ];
    const mockBatchContextValue = {
      batchs: mockBatch,
      setBatchs: vi.fn(),
      addToCart: vi.fn(),
      getCart: vi.fn(),
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
      rejectBatch: vi.fn(),
      acceptBatch: vi.fn(),
      updateBatch: vi.fn(),
      getBatchSellData: vi.fn(),
      getBatchSellDataYear: vi.fn(),
      updateCartQuantity: vi.fn(),
      createProductType: vi.fn(),
      fetchProductTypes: vi.fn(),
      productTypes: [],
      getReservation: vi.fn(),
      changeStatusAsRetrieved: vi.fn(),
      changeStatusAsAbandoned: vi.fn(),
      updateProductType: vi.fn(),
      updateBatchImage: vi.fn(),
      fetchImagesByProductName: vi.fn(),
      freeSale: vi.fn(),
      addRemovedQuantity: vi.fn(),
      subRemovedQuantity: vi.fn(),
      emptyCart: vi.fn(),
    };
    const mockUserContextValue = {
      authenticatedUser: {
        email: 'test@example.com',
        firstName: 'John',
        role: 'PRODUCER',
        token: 'mock-token',
      },
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
      <BatchContext.Provider value={mockBatchContextValue}>
        <UserContext.Provider value={mockUserContextValue}>
          <MemoryRouter>
            <BatchHistoryPage />
          </MemoryRouter>
        </UserContext.Provider>
      </BatchContext.Provider>,
    );

    expect(screen.getByText('Lots vendus par le passé')).not.toBeNull();
    expect(screen.getByText('Carottes')).not.toBeNull();
  });

  test('Should display message because no batches', () => {
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
      batch: undefined,
      setCart: vi.fn(),
      reserveCart: vi.fn(),
      removeFromCart: vi.fn(),
      fetchCart: vi.fn(),
      getUserReservations: vi.fn(),
      getReservationLines: vi.fn(),
      cancelReservation: vi.fn(),
      rejectBatch: vi.fn(),
      acceptBatch: vi.fn(),
      updateBatch: vi.fn(),
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
      authenticatedUser: {
        email: 'test@example.com',
        firstName: 'John',
        role: 'PRODUCER',
        token: 'mock-token',
      },
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
      <BatchContext.Provider value={mockBatchContextValue}>
        <UserContext.Provider value={mockUserContextValue}>
          <MemoryRouter>
            <BatchHistoryPage />
          </MemoryRouter>
        </UserContext.Provider>
      </BatchContext.Provider>,
    );

    expect(screen.getByText('Aucun lot en vente actuellement.')).not.toBeNull();
    expect(screen.getByText('Aucun lot vendu par le passé.')).not.toBeNull();
  });
});
