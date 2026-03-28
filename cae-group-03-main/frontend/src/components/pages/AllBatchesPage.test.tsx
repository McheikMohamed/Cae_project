import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BatchContext } from '../../contexts/BatchContext';
import { UserContext } from '../../contexts/UserContext';
import AllBatchesPage from './AllBatchesPage';

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
    status: 'refused',
    rejectionReason: 'Produit abîmé',
  },
  {
    idBatch: 2,
    pricePerUnit: 20,
    imageLocation: 'img2.jpg',
    product: {
      idProduct: 2,
      name: 'Carottes',
      description: 'Légumes frais',
      productType: { libelle: 'Légumes' },
      unit: { name: 'kg' },
    },
    receiptDate: new Date('2024-07-01'),
    quantity: 5,
    producer: {
      email: 'test@example.com',
      password: 'password123',
      role: 'producer',
      firstName: 'John',
      token: 'mock-token',
    },
    status: 'approved',
  },
];

const mockBatchContextValue = {
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
  emptyCart: vi.fn(),
  addRemovedQuantity: vi.fn(),
  subRemovedQuantity: vi.fn(),
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

const renderComponent = () => {
  return render(
    <UserContext.Provider value={mockUserContextValue}>
      <BatchContext.Provider value={mockBatchContextValue}>
        <MemoryRouter>
          <AllBatchesPage />
        </MemoryRouter>
      </BatchContext.Provider>
    </UserContext.Provider>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AllBatchesPage', () => {
  test('should render refused and approved batches', () => {
    renderComponent();

    expect(screen.getByText('Lots refusés')).not.toBeNull();
    expect(screen.getByText('Pommes')).not.toBeNull();
    expect(screen.getByText('Produit abîmé')).not.toBeNull();

    expect(screen.getByText('Lots approuvés')).not.toBeNull();
    expect(screen.getByText('Carottes')).not.toBeNull();
  });
});
