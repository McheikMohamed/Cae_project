import {
  fetchAllBatches,
  fetchBatchById,
  createBatch,
  fetchAllProducts,
  fetchBatchSellData,
} from './batchApi';
import { describe, test, expect, vi, afterEach } from 'vitest';

global.fetch = vi.fn();

const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

describe('batchApi service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('fetchAllBatches - should return list of batches', async () => {
    const mockData = [{ id: 1, name: 'Batch 1' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchAllBatches();
    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith('/api/batches/all');
  });

  test('fetchBatchById - should return a single batch', async () => {
    const mockBatch = { id: '1', name: 'Test Batch' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBatch,
    });

    const result = await fetchBatchById('1');
    expect(result).toEqual(mockBatch);
    expect(mockFetch).toHaveBeenCalledWith('/api/batches/1');
  });

  test('createBatch - should send FormData and return created batch', async () => {
    const mockBatch = {
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
    };

    const mockResponse = { id: 1, ...mockBatch };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createBatch(mockBatch, 'mock-token');
    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalled();
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs?.headers?.Authorization).toBe('mock-token');
  });

  test('fetchAllProducts - should return list of products', async () => {
    const mockProducts = [{ id: 1, name: 'Carotte' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const result = await fetchAllProducts();
    expect(result).toEqual(mockProducts);
    expect(mockFetch).toHaveBeenCalledWith('/api/batches/products');
  });

  test('fetchBatchSellData - should transform raw data correctly', async () => {
    const raw = [['1', 4, 2024, 100, 20]];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => raw,
    });

    const result = await fetchBatchSellData('1', 'mock-token');
    expect(result).toEqual([
      {
        idProduct: 1,
        month: 4,
        year: 2024,
        totalReceivedQuantity: 100,
        totalSoldQuantity: 20,
      },
    ]);
    expect(mockFetch).toHaveBeenCalledWith('/api/batches/sellData/1', {
      headers: { Authorization: 'mock-token' },
    });
  });

  test.each([
    ['fetchAllBatches', fetchAllBatches, '/api/batches/all'],
    ['fetchBatchById', () => fetchBatchById('1'), '/api/batches/1'],
    ['fetchAllProducts', fetchAllProducts, '/api/batches/products'],
    [
      'fetchBatchSellData',
      () => fetchBatchSellData('1', 'mock-token'),
      '/api/batches/sellData/1',
    ],
  ])('%s - should throw error on bad response', async (_, fn, url) => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    await expect(fn()).rejects.toThrow('fetch error : 500 : Server Error');
    if (url === '/api/batches/sellData/1') {
      expect(mockFetch).toHaveBeenCalledWith(url, {
        headers: { Authorization: 'mock-token' },
      });
    } else {
      expect(mockFetch).toHaveBeenCalledWith(url);
    }
  });
});
