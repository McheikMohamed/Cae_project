import {
  Batch,
  NewBatch,
  Product,
  BatchSellData,
  BatchSellDataYear,
} from '../types';

export const fetchAllBatches = async (): Promise<Batch[]> => {
  const response = await fetch('/api/batches/all');
  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }
  return response.json();
};

export const fetchBatchById = async (id: string): Promise<Batch> => {
  const response = await fetch(`/api/batches/${id}`);
  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }
  return response.json();
};

export const createBatch = async (
  newBatch: NewBatch,
  token: string,
): Promise<Batch> => {
  const formData = new FormData();
  const batchToBeCreated = { ...newBatch };
  delete batchToBeCreated.image;
  delete batchToBeCreated.imageLocation;

  if (newBatch.image) {
    formData.append('picture', newBatch.image);
  }

  formData.append(
    'newBatch',
    new Blob([JSON.stringify(batchToBeCreated)], { type: 'application/json' }),
  );

  const response = await fetch('/api/batches/create', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }
  return response.json();
};

export const createBatchWithUrl = async (
  newBatch: NewBatch,
  pictureUrl: string,
  token: string,
): Promise<Batch> => {
  const formData = new FormData();
  const batchToBeCreated = { ...newBatch };
  delete batchToBeCreated.image;
  delete batchToBeCreated.imageLocation;

  // Ajouter le batch en tant que JSON
  formData.append(
    'newBatch',
    new Blob([JSON.stringify(batchToBeCreated)], { type: 'application/json' }),
  );

  // Ajouter l'URL de l'image
  formData.append('picture', pictureUrl);

  const response = await fetch('/api/batches/createWithUrl', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }

  return response.json();
};

export const fetchAllProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/batches/products');
  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }
  return response.json();
};

export const fetchBatchSellData = async (
  id: string,
  token: string,
): Promise<BatchSellData[]> => {
  const response = await fetch(`/api/batches/sellData/${id}`, {
    headers: {
      Authorization: token,
    },
  });
  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }

  type RawBatchSellData = [string, number, number, number, number];
  const rawData: RawBatchSellData[] = await response.json();

  return rawData.map((item) => ({
    idProduct: Number(item[0]),
    month: item[1],
    year: item[2],
    totalReceivedQuantity: item[3],
    totalSoldQuantity: item[4],
  }));
};

export const fetchBatchSellDataYear = async (
  id: string,
  token: string,
): Promise<BatchSellDataYear[]> => {
  const response = await fetch(`/api/batches/sellDataYear/${id}`, {
    headers: {
      Authorization: token,
    },
  });
  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }

  type RawBatchSellDataYear = [string, number, number, number];
  const rawData: RawBatchSellDataYear[] = await response.json();

  return rawData.map((item) => ({
    idProduct: Number(item[0]),
    year: item[1],
    totalReceivedQuantity: item[2],
    totalSoldQuantity: item[3],
  }));
};

export const updateBatchStatus = async (
  idBatch: number,
  status: string,
  reason: string | null,
  token: string,
): Promise<void> => {
  const response = await fetch(`/api/batches/${idBatch}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason, status }),
  });

  if (!response.ok) {
    throw new Error(
      `fetch error : ${response.status} : ${response.statusText}`,
    );
  }
};
