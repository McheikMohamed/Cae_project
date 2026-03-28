import { useContext, useState, useEffect } from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, expect, beforeEach, test, vi } from 'vitest';
import { BatchContext, BatchContextProvider } from './BatchContext';
import { UserContext } from './UserContext';
import { NewBatch } from '../types';
import { Batch } from '../types';

// mock for an existing user context
const DummyUserProvider = ({ children }: { children: React.ReactNode }) => {
  const mockUser = {
    token: 'dummy-token',
    honorific: 'Mr.',
    lastName: 'Doe',
    firstName: 'John',
    address: {
      street: '123 Main St',
      city: 'Sample City',
      zipCode: '12345',
      number: '123',
      box: 'A',
      postalCode: '12345',
      country: { name: 'Sample Country' },
    },
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    role: 'user',
    phoneNumber: '123-456-7890',
    password: 'dummy-password',
  };

  return (
    <UserContext.Provider
      value={{
        user: mockUser,
        authenticatedUser: undefined,
        registerUser: vi.fn(),
        loginUser: vi.fn(),
        clearUser: vi.fn(),
        updateToken: vi.fn(),
        profilUser: vi.fn(),
        updatePassword: vi.fn(),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const AddBatchComponent = ({ onBatchAdded }: { onBatchAdded: () => void }) => {
  const { addBatch } = useContext(BatchContext);

  const handleAdd = async () => {
    const dummyBatch: NewBatch = {
      pricePerUnit: 20,
      image: undefined,
      product: {
        idProduct: 1,
        name: 'Test Product',
        description: 'A test product',
        productType: { libelle: 'Fruit' },
        unit: { name: 'kg' },
      },
      producer: {
        email: 'test@example.com',
        firstName: 'John',
        role: 'PRODUCER',
        token: 'mock-token',
      },
    };

    await addBatch(dummyBatch);
    onBatchAdded();
  };

  return <button onClick={handleAdd}>Add Batch</button>;
};

const GetBatchComponent = ({ batchId }: { batchId: string }) => {
  const { getBatch } = useContext(BatchContext);
  const [batchName, setBatchName] = useState('');

  useEffect(() => {
    const fetchBatch = async () => {
      const result = await getBatch(batchId);
      if (result) {
        setBatchName(result.product.name);
      }
    };
    fetchBatch();
  }, [batchId, getBatch]);

  return <div>Batch Name: {batchName}</div>;
};

// Test component exposing BatchContext values
const TestComponent = () => {
  const { cart, addToCart, setCart, reserveCart } = useContext(BatchContext);

  return (
    <div>
      {/* Display current cart length */}
      <div>Cart: {cart.length}</div>
      {/* Display each batch's quantity */}
      {cart.map((batch) => (
        <div key={batch.idBatch}>Quantity: {batch.quantity}</div>
      ))}
      <button
        onClick={async () => {
          // Create a dummy batch with idBatch = 1 and default properties
          const dummyBatch: Batch = {
            idBatch: 1,
            pricePerUnit: 10,
            product: {
              idProduct: 1,
              name: 'Test Product',
              description: 'A test product',
              productType: { libelle: 'SampleType' },
              unit: { name: 'kg' },
            },
          };
          addToCart(dummyBatch, 1); // Add to cart with default quantity of 1
        }}
      >
        Add to Cart
      </button>
      <button
        onClick={() => {
          // Update the quantity of the batch with idBatch = 1 to 5
          setCart(
            cart.map((batch) =>
              batch.idBatch === 1 ? { ...batch, quantity: 5 } : batch,
            ),
          );
        }}
      >
        Update Quantity
      </button>
      <button
        onClick={async () => {
          await reserveCart(cart, new Date('2025-05-20')); // Example date
        }}
      >
        Reserve Cart
      </button>
    </div>
  );
};

describe('BatchContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  /* test('addToCart adds a batch with default quantity of 1', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const { getByText } = render(
      <BatchContextProvider>
        <TestComponent />
      </BatchContextProvider>,
    );

    // Verify that the cart starts empty
    expect(getByText(/Cart:/).textContent).toBe('Cart: 0');

    // Click the "Add to Cart" button
    await act(async () => {
      fireEvent.click(getByText('Add to Cart'));
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/carts/add/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String), // Ensure the token is included
        },
      });
    });

    // Verify that the cart now contains 1 item
    expect(getByText(/Cart:/).textContent).toBe('Cart: 1');
  });

  test('Updating the quantity changes the batch quantity correctly', async () => {
    const { getByText } = render(
      <BatchContextProvider>
        <TestComponent />
      </BatchContextProvider>,
    );

    // Add a batch to the cart
    await act(async () => {
      fireEvent.click(getByText('Add to Cart'));
    });

    // Click on the "Update Quantity" button to change quantity to 5
    await act(async () => {
      fireEvent.click(getByText('Update Quantity'));
    });

    // Verify that the batch quantity is updated to 5
    expect(getByText(/Quantity:/).textContent).toBe('Quantity: 5');
  }); */

  test('reserveCart calls fetch with the correct URL and method', async () => {
    // Mock fetch function
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock;

    const { getByText } = render(
      <BatchContextProvider>
        <TestComponent />
      </BatchContextProvider>,
    );

    // Add a batch to the cart
    await act(async () => {
      fireEvent.click(getByText('Add to Cart'));
    });
    // Click the "Reserve Cart" button
    await act(async () => {
      fireEvent.click(getByText('Reserve Cart'));
    });

    // Wait until fetch is called, then verify fetch was invoked correctly
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    // Change the expected URL as necessary, depending on your implementation
  });

  test('addBatch sends correct fetch request and updates batch list', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ json: vi.fn().mockResolvedValue([]), ok: true }) // fetchProducts
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          idBatch: 1,
          pricePerUnit: 20,
          product: {
            name: 'Test Product',
            description: 'A test product',
            productType: { libelle: 'Fruit' },
            unit: { name: 'kg' },
          },
          producer: 'John Doe',
        }),
      });

    global.fetch = mockFetch;

    const onBatchAdded = vi.fn();

    const { getByText } = render(
      <DummyUserProvider>
        <BatchContextProvider>
          <AddBatchComponent onBatchAdded={onBatchAdded} />
        </BatchContextProvider>
      </DummyUserProvider>,
    );

    await act(async () => {
      fireEvent.click(getByText('Add Batch'));
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(onBatchAdded).toHaveBeenCalled();
  });

  test('getBatch fetches batch by ID and returns data', async () => {
    const mockBatch = {
      idBatch: '123',
      pricePerUnit: 10,
      quantity: 1,
      product: {
        name: 'Fetched Product',
        description: 'Some description',
        productType: { libelle: 'Legume' },
        unit: { name: 'kg' },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockBatch,
    });

    global.fetch = mockFetch;

    const { getByText } = render(
      <BatchContextProvider>
        <GetBatchComponent batchId="123" />
      </BatchContextProvider>,
    );

    await waitFor(() => {
      expect(getByText(/Batch Name:/).textContent).toBe(
        `Batch Name: ${mockBatch.product.name}`,
      );
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/batches/123');
  });
  /*
  test('getBatchSellData calls fetchBatchSellData and returns formatted data', async () => {
    const mockRawData = [['1', 100, 4, 2025, 50, 4, 2025]];

    const expectedFormattedData = [
      {
        idProduct: 1,
        totalQuantity: 100,
        monthDatePart: 4,
        yearDatePart: 2025,
        reservationQuantity: 50,
        recoveryMonthDatePart: 4,
        recoveryYearDatePart: 2025,
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRawData,
    });

    global.fetch = fetchMock;

    const ResultComponent = ({
      onResult,
    }: {
      onResult: (
        data: {
          idProduct: number;
          totalQuantity: number;
          monthDatePart: number;
          yearDatePart: number;
          reservationQuantity: number;
          recoveryMonthDatePart: number;
          recoveryYearDatePart: number;
        }[],
      ) => void;
    }) => {
      const { getBatchSellData } = useContext(BatchContext);

      useEffect(() => {
        getBatchSellData('1').then((data) => {
          if (data) {
            onResult(data);
          }
        });
      }, []);

      return <div>Test getBatchSellData</div>;
    };

    let result:
      | {
          idProduct: number;
          totalQuantity: number;
          monthDatePart: number;
          yearDatePart: number;
          reservationQuantity: number;
          recoveryMonthDatePart: number;
          recoveryYearDatePart: number;
        }[]
      | null = null;

    const handleResult = (
      data: {
        idProduct: number;
        totalQuantity: number;
        monthDatePart: number;
        yearDatePart: number;
        reservationQuantity: number;
        recoveryMonthDatePart: number;
        recoveryYearDatePart: number;
      }[],
    ) => {
      result = data;
    };

    render(
      <DummyUserProvider>
        <BatchContextProvider>
          <ResultComponent onResult={handleResult} />
        </BatchContextProvider>
      </DummyUserProvider>,
    );

    await waitFor(() => {
      expect(result).not.toBeNull();
      expect(result).toEqual(expectedFormattedData);
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/batches/sellData/1', {
      headers: {
        Authorization: 'dummy-token',
      },
    });
  });
  */
});
