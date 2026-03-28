import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChartBatchPage from './ChartBatchPage';
import { BatchContext } from '../../contexts/BatchContext';

describe('ChartBatchPage', () => {
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

  const mockBatchSellData = [
    {
      idProduct: 1,
      year: 2024,
      month: 1,
      totalReceivedQuantity: 10,
      totalSoldQuantity: 4,
    },
    {
      idProduct: 1,
      year: 2024,
      month: 2,
      totalReceivedQuantity: 20,
      totalSoldQuantity: 10,
    },
    {
      idProduct: 1,
      year: 2025,
      month: 1,
      totalReceivedQuantity: 30,
      totalSoldQuantity: 5,
    },
  ];

  const mockBatchSellDataYear = [
    {
      idProduct: 1,
      year: 2024,
      totalReceivedQuantity: 30,
      totalSoldQuantity: 14,
    },
    {
      idProduct: 1,
      year: 2025,
      totalReceivedQuantity: 30,
      totalSoldQuantity: 5,
    },
  ];

  const mockGetBatchSellData = vi.fn().mockResolvedValue(mockBatchSellData);
  const mockGetBatchSellDataYear = vi
    .fn()
    .mockResolvedValue(mockBatchSellDataYear);

  const mockContextValue = {
    batchs: mockBatchs,
    getBatchSellData: mockGetBatchSellData,
    getBatchSellDataYear: mockGetBatchSellDataYear,
    batchSellData: mockBatchSellData,
    batchSellDataYear: mockBatchSellDataYear,
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
    updateProductType: vi.fn(),
    updateBatchImage: vi.fn(),
    fetchImagesByProductName: vi.fn(),
    freeSale: vi.fn(),
    addRemovedQuantity: vi.fn(),
    subRemovedQuantity: vi.fn(),
    emptyCart: vi.fn(),
  };

  const renderComponent = (batchId: string) => {
    return render(
      <BatchContext.Provider value={mockContextValue}>
        <MemoryRouter initialEntries={[`/chart-batch/${batchId}`]}>
          <Routes>
            <Route path="/chart-batch/:batchId" element={<ChartBatchPage />} />
          </Routes>
        </MemoryRouter>
      </BatchContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should render batch name and chart for valid batch', async () => {
    renderComponent('1');
    const select = await screen.findByLabelText('Année');

    expect(
      await screen.findByText('Statistiques du produit: Pommes'),
    ).toBeTruthy();
    expect(select).toBeTruthy();
    expect(select.textContent).toContain('2025');
    expect(mockGetBatchSellData).toHaveBeenCalledWith('1');
    expect(mockGetBatchSellDataYear).toHaveBeenCalledWith('1');
  });

  test('Should update chart when year is changed', async () => {
    renderComponent('1');

    const select = await screen.findByLabelText('Année');
    fireEvent.mouseDown(select);

    const yearOptions = await screen.findAllByText('2024');

    const menuOption = yearOptions.find((el) =>
      el.closest('li[role="option"]'),
    );

    expect(menuOption).toBeTruthy();
    fireEvent.click(menuOption!);

    expect(select.textContent).toContain('2024');
  });

  test('Should display error message when batch is not found', async () => {
    const contextWithoutBatch = {
      ...mockContextValue,
      batchs: [],
    };

    render(
      <BatchContext.Provider value={contextWithoutBatch}>
        <MemoryRouter initialEntries={['/chart-batch/999']}>
          <Routes>
            <Route path="/chart-batch/:batchId" element={<ChartBatchPage />} />
          </Routes>
        </MemoryRouter>
      </BatchContext.Provider>,
    );

    expect(await screen.findByText('Lot introuvable')).toBeTruthy();
  });
});
