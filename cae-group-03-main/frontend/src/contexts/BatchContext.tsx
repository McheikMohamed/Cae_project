import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import {
  Batch,
  NewBatch,
  BatchContextType,
  Product,
  BatchSellData,
  BatchSellDataYear,
  Reservation,
  ReservationLine,
  CartItem,
  ReservationUser,
} from '../types';
import { UserContext } from './UserContext';
import {
  fetchAllBatches,
  fetchBatchById,
  createBatch,
  fetchAllProducts,
  updateBatchStatus as apiUpdateBatchStatus,
  fetchBatchSellData,
  fetchBatchSellDataYear,
  createBatchWithUrl,
} from '../services/batchApi';

const defaultProjectContext: BatchContextType = {
  batchs: [],
  setBatchs: () => {},
  addBatch: async () => {},
  products: [],
  setProducts: () => {},
  getBatch: async () => null,
  addToCart: async () => {},
  fetchCart: async () => {},
  removeFromCart: async () => {},
  batch: undefined,
  cart: [],
  setCart: () => {},
  emptyCart: async () => {},
  reserveCart: async () => {},
  acceptBatch: async () => {},
  rejectBatch: async () => {},
  updateBatch: async () => {},
  getBatchSellData: async () => null,
  batchSellData: [],
  getBatchSellDataYear: async () => null,
  batchSellDataYear: [],
  getUserReservations: async () => [],
  getReservationLines: async () => [],
  cancelReservation: async () => {},
  updateCartQuantity: async () => {},
  createProductType: async () => {},
  fetchProductTypes: async () => {},
  productTypes: [],
  getReservation: async () => [],
  changeStatusAsRetrieved: async () => {},
  changeStatusAsAbandoned: async () => {},
  updateProductType: async () => {},
  updateBatchImage: async () => {},
  fetchImagesByProductName: async () => [],
  freeSale: async () => {},
  addRemovedQuantity: async () => {},
  subRemovedQuantity: async () => {},
};

const BatchContext = createContext<BatchContextType>(defaultProjectContext);

const BatchContextProvider = ({ children }: { children: ReactNode }) => {
  const { authenticatedUser } = useContext(UserContext);
  const [batchs, setBatchs] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Batch[]>([]);
  const [batchSellData, setBatchSellData] = useState<BatchSellData[]>([]);
  const [batchSellDataYear, setBatchSellDataYear] = useState<
    BatchSellDataYear[]
  >([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await fetch('/api/productTypes');
        const data = await response.json();
        setProductTypes(data.map((pt: { libelle: string }) => pt.libelle));
      } catch (err) {
        console.error(
          'Erreur lors de la récupération des types de produits :',
          err,
        );
      }
    };

    fetchProductTypes();
  }, []);

  // Cart space
  // Refactored addToCart function to use fetch API
  const addToCart = async (
    batch: Batch,
    quantity: number = 1,
  ): Promise<void> => {
    try {
      if (!authenticatedUser) {
        return;
      }

      const existingItem = cart.find((item) => item.idBatch === batch.idBatch);
      const isAlreadyInCart = !!existingItem;

      const response = await fetch(
        isAlreadyInCart
          ? `/api/carts/updateQuantity/${batch.idBatch}`
          : `/api/carts/add`,
        {
          method: isAlreadyInCart ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authenticatedUser.token,
          },
          body: JSON.stringify({
            idBatch: batch.idBatch,
            quantity: quantity,
          }),
        },
      );

      if (!response.ok) {
        return;
      }

      await fetchCart(); // Update the cart
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error);
    }
  };
  const fetchCart = useCallback(async () => {
    if (!authenticatedUser) {
      setCart([]);
      return;
    }

    try {
      const response = await fetch('/api/carts/', {
        headers: {
          Authorization: authenticatedUser.token,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error(
          'Erreur lors de la récupération du panier :',
          errorMessage,
        );
        return;
      }

      const cartData: CartItem[] = await response.json();

      // verify tht each item has a quantity
      setCart(
        cartData.map((item) => ({
          ...item.batch,
          quantity: item.quantity ?? 1,
        })),
      );
    } catch (error) {
      console.error('Erreur lors du fetch du panier :', error);
    }
  }, [authenticatedUser, setCart]);

  const updateCartQuantity = async (
    batchId: number,
    quantity: number,
  ): Promise<void> => {
    if (!authenticatedUser) return;

    try {
      const response = await fetch(`/api/carts/updateQuantity/${batchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser.token,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erreur mise à jour : ${errorMessage}`);
      }

      await fetchCart(); // to garanty that the cart is updated
    } catch (err) {
      console.error('Erreur mise à jour quantité :', err);
    }
  };

  const removeFromCart = async (batchId: number): Promise<void> => {
    if (!authenticatedUser) return;

    try {
      const response = await fetch(`/api/carts/delete/${batchId}`, {
        method: 'DELETE',
        headers: {
          Authorization: authenticatedUser.token,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.log(`Erreur suppression : ${errorMessage}`);
        return;
      }

      await fetchCart(); // update the cart
    } catch (error) {
      console.error('Erreur suppression panier :', error);
    }
  };

  useEffect(() => {
    if (authenticatedUser) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [authenticatedUser, fetchCart]);

  const reserveCart = async (
    cart: Batch[],
    reservationsDate: Date,
  ): Promise<void> => {
    const offsetInMilliseconds = 2 * 60 * 60 * 1000; // GMT+2 (2 heures)
    const adjustedDate = new Date(
      reservationsDate.getTime() + offsetInMilliseconds,
    );
    const isoDate = adjustedDate.toISOString();
    console.log('Date avant envoi : ', reservationsDate);
    console.log('Date après envoi : ', isoDate);
    try {
      const response = await fetch('/api/reservations/createReservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token}`, // Pass the authentication token
        },
        body: JSON.stringify({
          cart: cart.map((batch) => ({
            idBatch: batch.idBatch,
            quantity: batch.quantity || 1, // Default to 1 if quantity is
          })),
          date: isoDate, // Convert to ISO string for the backend
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la réservation : ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Erreur lors de la réservation :', error);
    }
  };

  const getUserReservations = async (): Promise<Reservation[]> => {
    try {
      const token = authenticatedUser?.token;
      if (!token) {
        throw new Error('Vous devez être connecté pour voir vos réservations.');
      }

      const response = await fetch('/api/reservations/getReservationsUser', {
        method: 'GET',
        headers: {
          Authorization: `${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(
          `Erreur lors de la récupération des réservations : ${errorMessage}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations :', error);
      throw error;
    }
  };

  const getReservationLines = async (
    reservationId: number,
  ): Promise<ReservationLine[]> => {
    try {
      const token = authenticatedUser?.token;
      if (!token) {
        throw new Error(
          'Vous devez être connecté pour voir les détails de votre réservation.',
        );
      }
      const response = await fetch(
        `/api/reservations/getReservationLinesById?reservationId=${reservationId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(
          `Erreur lors de la récupération des détails de la réservation : ${errorMessage}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des détails de la réservation :',
        error,
      );
      throw error;
    }
  };

  const cancelReservation = async (reservationId: number): Promise<void> => {
    try {
      const token = authenticatedUser?.token;
      if (!token) {
        throw new Error(
          'Vous devez être connecté pour annuler une réservation.',
        );
      }
      console.log(
        'reservationId',
        reservationId,
        'reservationId type',
        typeof reservationId,
      );

      const response = await fetch(
        `/api/reservations/updateReservationStatus`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({ reservationId, status: 'removed' }),
        },
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erreur : ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation :", error);
      throw error;
    }
  };

  const changeStatusAsRetrieved = async (
    reservationId: number,
  ): Promise<void> => {
    try {
      const response = await fetch(
        `/api/reservations/updateReservationStatus`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reservationId, status: 'approved' }),
        },
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erreur : ${errorMessage}`);
      }
    } catch (error) {
      console.error('Erreur lors du changement d etat en approved :', error);
      throw error;
    }
  };

  const changeStatusAsAbandoned = async (
    reservationId: number,
  ): Promise<void> => {
    try {
      const response = await fetch(
        `/api/reservations/updateReservationStatus`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reservationId, status: 'abandoned' }),
        },
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erreur : ${errorMessage}`);
      }
    } catch (error) {
      console.error('Erreur lors du changement d etat en abandoned :', error);
      throw error;
    }
  };

  const getReservation = async (): Promise<ReservationUser[]> => {
    const response = await fetch(
      `/api/reservations/getReservationsWithUserName`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return await response.json();
  };

  // Batch space ******************************************************************************
  const fetchProducts = useCallback(async () => {
    try {
      const products = await fetchAllProducts();
      setProducts(products);
    } catch (err) {
      console.error('fetchProducts::error: ', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addBatch = async (newBatch: NewBatch) => {
    try {
      if (!authenticatedUser) {
        throw new Error('You must be authenticated to add a batch');
      }
      if (newBatch.image) {
        const createdBatch = await createBatch(
          newBatch,
          authenticatedUser.token,
        );
        setBatchs([...batchs, createdBatch]);
      } else if (newBatch.imageLocation) {
        const createdBatchWithUrl = await createBatchWithUrl(
          newBatch,
          newBatch.imageLocation,
          authenticatedUser.token,
        );
        setBatchs([...batchs, createdBatchWithUrl]);
      }
      await fetchProducts();
    } catch (err) {
      console.error('AddBatch::error: ', err);
    }
  };

  const fetchImagesByProductName = async (
    productName: string,
  ): Promise<string[]> => {
    try {
      const response = await fetch(
        `/api/batches/getImagesByProductName?productName=${productName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erreur : ${errorMessage}`);
      }

      return await response.json(); // Retourne la liste des URLs d'images
    } catch (error) {
      console.error('Erreur lors de la récupération des images :', error);
      throw error; // Relance l'erreur pour que l'appelant puisse la gérer
    }
  };

  const updateBatchImage = async (idBatch: number, image: File) => {
    try {
      if (!authenticatedUser) {
        throw new Error('You must be authenticated to update a batch image');
      }

      const formData = new FormData();
      formData.append('picture', image); // Assurez-vous que le champ correspond à "picture" dans votre backend

      const response = await fetch(`/api/batches/${idBatch}/updateImage`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erreur : ${errorMessage}`);
      }

      const updatedBatch = await response.json(); // Supposons que le backend renvoie le batch mis à jour

      // Mettre à jour l'état des batchs
      setBatchs((prevBatchs) =>
        prevBatchs.map((batch) =>
          batch.idBatch === idBatch ? { ...batch, ...updatedBatch } : batch,
        ),
      );
    } catch (err) {
      console.error('UpdateBatchImage::error: ', err);
    }
  };

  const getBatch = async (id: string): Promise<Batch | null> => {
    try {
      return await fetchBatchById(id);
    } catch (err) {
      console.error('getBatch::error: ', err);
      return null;
    }
  };

  const fetchBatchs = useCallback(async () => {
    try {
      const batchs = await fetchAllBatches();
      setBatchs(batchs);
    } catch (err) {
      console.error('fetchBatchs::error: ', err);
    }
  }, []);

  useEffect(() => {
    fetchBatchs();
  }, [fetchBatchs]);

  const getBatchSellData = useCallback(
    async (batchId: string): Promise<BatchSellData[] | null> => {
      try {
        const token = authenticatedUser?.token;
        if (!token) {
          console.warn('You must be authenticated to fetch batch sell data.');
          return null;
        }
        const data = await fetchBatchSellData(batchId, token);
        if (data) {
          setBatchSellData(data);
          return data;
        }
        return null;
      } catch (err) {
        console.error('getBatchSellData::error: ', err);
        return null;
      }
    },
    [authenticatedUser?.token, setBatchSellData],
  );

  const getBatchSellDataYear = useCallback(
    async (batchId: string): Promise<BatchSellDataYear[] | null> => {
      try {
        const token = authenticatedUser?.token;
        if (!token) {
          console.warn('You must be authenticated to fetch batch sell data.');
          return null;
        }
        const data = await fetchBatchSellDataYear(batchId, token);
        if (data) {
          setBatchSellDataYear(data);
          return data;
        }
        return null;
      } catch (err) {
        console.error('getBatchSellDataYear::error: ', err);
        return null;
      }
    },
    [authenticatedUser?.token, setBatchSellDataYear],
  );

  const updateBatch = async (
    idBatch: number,
    status:
      | 'waiting'
      | 'approved'
      | 'refused'
      | 'cancelled'
      | 'available'
      | 'removed',
    reason: string | null = null,
  ): Promise<void> => {
    if (!authenticatedUser) throw new Error('Not authenticated');
    await apiUpdateBatchStatus(
      idBatch,
      status,
      reason,
      authenticatedUser.token,
    );
    setBatchs((prev) =>
      prev.map((b) =>
        b.idBatch === idBatch
          ? { ...b, status, ...(reason ? { rejectionReason: reason } : {}) }
          : b,
      ),
    );
  };

  const acceptBatch = (id: number) => updateBatch(id, 'approved');
  const rejectBatch = (id: number, reason: string) =>
    updateBatch(id, 'refused', reason);

  const createProductType = async (libelle: string): Promise<void | string> => {
    try {
      const token = authenticatedUser?.token;
      if (!token) {
        throw new Error(
          'Vous devez être connecté pour créer un type de produit.',
        );
      }

      const response = await fetch('/api/batches/AddProductTypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ libelle }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(
          `Erreur lors de la création du type de produit : ${errorMessage}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du type de produit :', error);
      throw error;
    }
  };

  const fetchProductTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/batches/productTypes');
      if (!response.ok) throw new Error('Erreur réseau');

      const data = await response.json();
      const libelles = data.map((pt: { libelle: string }) => pt.libelle);
      setProductTypes(libelles);
    } catch (err) {
      console.error(
        'Erreur lors de la récupération des types de produits :',
        err,
      );
    }
  }, []);

  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  const updateProductType = async (
    oldLibelle: string,
    newLibelle: string,
  ): Promise<void | string> => {
    console.log('updateProductType called with:', oldLibelle, newLibelle);
    try {
      const token = authenticatedUser?.token;
      if (!token) {
        throw new Error(
          'Vous devez être connecté pour créer un type de produit.',
        );
      }
      const response = await fetch(`/api/batches/productTypes/${oldLibelle}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ libelle: newLibelle }),
      });

      if (response.status === 409) {
        const errorMessage = await response.text();
        return errorMessage; // Ex: "Un type avec ce libellé existe déjà."
      }

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du type de produit');
      }

      // Optionnel : rafraîchir la liste
      await fetchProductTypes();
    } catch (error) {
      console.error('Erreur updateProductType :', error);
      throw error;
    }
  };

  const freeSale = async (cart: Batch[]): Promise<void> => {
    try {
      const response = await fetch('/api/freesale/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token}`, // Pass the authentication token
        },
        body: JSON.stringify({
          cart: cart.map((batch) => ({
            idBatch: batch.idBatch,
            quantity: batch.quantity || 1, // Default to 1 if quantity is
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la réservation : ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Erreur lors de la réservation :', error);
    }
  };

  const addRemovedQuantity = async (cart: Batch[]): Promise<void> => {
    try {
      const response = await fetch('/api/batches/addRemovedQuantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token}`, // Pass the authentication token
        },
        body: JSON.stringify({
          cart: cart.map((batch) => ({
            idBatch: batch.idBatch,
            quantity: batch.quantity || 1, // Default to 1 if quantity is
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la réservation : ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Erreur lors de la réservation :', error);
    }
  };

  const subRemovedQuantity = async (cart: Batch[]): Promise<void> => {
    try {
      const response = await fetch('/api/batches/subRemovedQuantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token}`, // Pass the authentication token
        },
        body: JSON.stringify({
          cart: cart.map((batch) => ({
            idBatch: batch.idBatch,
            quantity: batch.quantity || 1, // Default to 1 if quantity is
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la réservation : ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Erreur lors de la réservation :', error);
    }
  };

  const emptyCart = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auths/emptyCart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authenticatedUser?.token}`, // Pass the authentication token
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du nettoyage  : ${response.statusText}`);
      }
      console.log('Panier vidé avec succès !');
    } catch (error) {
      console.error('Erreur lors du nettoyage :', error);
    }
  };

  // Fournir toutes les fonctions et états dans le contexte
  const myContext: BatchContextType = {
    products,
    setProducts,
    batchs,
    setBatchs,
    addBatch,
    getBatch,
    addToCart,
    cart,
    setCart,
    emptyCart,
    fetchCart,
    removeFromCart,
    reserveCart,
    batch: undefined,
    acceptBatch,
    rejectBatch,
    updateBatch,
    getBatchSellData,
    batchSellData,
    getBatchSellDataYear,
    batchSellDataYear,
    getUserReservations,
    getReservationLines,
    cancelReservation,
    updateCartQuantity,
    createProductType,
    fetchProductTypes,
    productTypes,
    getReservation,
    changeStatusAsRetrieved,
    changeStatusAsAbandoned,
    updateProductType,
    updateBatchImage,
    fetchImagesByProductName,
    freeSale,
    addRemovedQuantity,
    subRemovedQuantity,
  };

  return (
    <BatchContext.Provider value={myContext}>{children}</BatchContext.Provider>
  );
};

export { BatchContext, BatchContextProvider };
