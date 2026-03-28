// src/services/notificationApi.test.ts
import { createNotification, fetchNotificationsAPI } from './notificationApi';
import { vi, describe, afterEach, test, expect } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('notificationApi service', () => {
  const mockToken = 'mock-token';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    test('should call fetch with correct parameters and succeed', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await createNotification(
        { batchId: 1, message: 'Test message', reasonOfReject: 'Not good' },
        mockToken,
      );

      expect(fetch).toHaveBeenCalledWith('/api/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: mockToken,
        },
        body: JSON.stringify({
          batchId: 1,
          message: 'Test message',
          reasonOfReject: 'Not good',
        }),
      });
    });

    test('should throw error if response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
        createNotification(
          { batchId: 2, message: 'Failing message' },
          mockToken,
        ),
      ).rejects.toThrow('Error creating notification: Bad Request');
    });
  });

  describe('fetchNotificationsAPI', () => {
    test('should return formatted notification data', async () => {
      const mockResponse = [
        {
          id: 1,
          message: 'New notification',
          reasonOfReject: 'Invalid data',
          batch: { idBatch: 42 },
          producer: { email: 'producer@example.com' },
          read: false,
          date: '2024-04-15T10:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchNotificationsAPI(mockToken);

      expect(fetch).toHaveBeenCalledWith('/api/notifications/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: mockToken,
        },
      });

      expect(result).toEqual([
        {
          id: 1,
          message: 'New notification',
          reasonOfReject: 'Invalid data',
          batchId: 42,
          batch: { idBatch: 42 },
          producer: { email: 'producer@example.com' },
          read: false,
          date: new Date('2024-04-15T10:00:00.000Z'),
        },
      ]);
    });

    test('should throw error if fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(fetchNotificationsAPI(mockToken)).rejects.toThrow(
        'Error fetching notifications: Internal Server Error',
      );
    });
  });
});
