// services/notificationApi.ts
import { Notification } from '../types';

export const createNotification = async (
  notification: { batchId: number; message: string; reasonOfReject?: string },
  token: string,
): Promise<void> => {
  console.log('Appel API pour créer une notification :', notification);

  const response = await fetch('/api/notifications/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(notification),
  });

  if (!response.ok) {
    console.error(
      'Erreur lors de la création de la notification :',
      response.statusText,
    );
    throw new Error(`Error creating notification: ${response.statusText}`);
  }

  console.log('Notification créée avec succès dans le backend');
};

export const fetchNotificationsAPI = async (
  token: string,
): Promise<Notification[]> => {
  console.log('notificationApi: GET /api/notifications/all, token=', token);

  const response = await fetch('/api/notifications/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });

  console.log('notificationApi: response status=', response.status);

  if (!response.ok) {
    console.error('notificationApi: erreur fetchNotifs:', response.statusText);
    throw new Error(`Error fetching notifications: ${response.statusText}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await response.json();
  console.log('notificationApi: data reçue =', raw);

  const data: Notification[] = raw.map((n) => ({
    // si n.id existe (cas du test), on l'utilise, sinon on prend n.idNotification
    id: n.id ?? n.idNotification,
    batchId: n.batch.idBatch,
    batch: {
      ...n.batch,
      receiptDate: n.batch.receiptDate
        ? new Date(n.batch.receiptDate)
        : undefined,
    },
    message: n.message,
    reasonOfReject: n.reasonOfReject,
    producer: n.producer,
    read: n.read,
    date: new Date(n.date),
  }));

  console.log('notificationApi: data transformée =', data);
  return data;
};

export const markNotificationAsRead = async (
  notificationId: number,
  token: string,
): Promise<void> => {
  console.log(
    `notificationApi: POST /api/notifications/${notificationId}/read`,
  );

  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });

  if (!response.ok) {
    console.error(
      'notificationApi: erreur markNotificationAsRead:',
      response.status,
      response.statusText,
    );
    throw new Error(
      `Error marking notification as read: ${response.status} ${response.statusText}`,
    );
  }
};
