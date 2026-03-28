import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BatchContext } from '../../contexts/BatchContext';
import Dashboard from './DashboardPage';

describe('DashboardPage', () => {
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
    {
      idBatch: 2,
      pricePerUnit: 20,
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
        token: 'mock-token',
      },
      status: 'available',
    },
    {
      idBatch: 3,
      pricePerUnit: 2.5,
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
    updateBatch: vi.fn(),
    rejectBatch: vi.fn(),
    acceptBatch: vi.fn(),
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

  const renderComponent = () => {
    return render(
      <BatchContext.Provider value={mockContextValue}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </BatchContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should render all unique products', () => {
    renderComponent();

    expect(screen.getByText('Pommes')).not.toBeNull();
    expect(screen.getByText('Fruits bio')).not.toBeNull();

    expect(screen.getByText('Carottes')).not.toBeNull();
    expect(screen.getByText('Légumes frais')).not.toBeNull();
  });

  test('Filter products with search bar', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Recherche...');
    fireEvent.change(searchInput, { target: { value: 'Pommes' } });

    expect(screen.getByText('Pommes')).not.toBeNull();
    expect(screen.queryByText('Carottes')).toBeNull();
  });

  test('Filter products with select type', () => {
    renderComponent();

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    const fruitsOption = screen.getByText('Fruits');
    fireEvent.click(fruitsOption);

    expect(screen.getByText('Pommes')).not.toBeNull();
    expect(screen.queryByText('Carottes')).toBeNull();
  });
});
