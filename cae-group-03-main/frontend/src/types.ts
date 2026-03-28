interface BatchContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  batchs: Batch[];
  cart: Batch[];
  setCart: (cart: Batch[]) => void;
  emptyCart: () => void;
  setBatchs: (batch: Batch[]) => void;
  addBatch: (newBatch: NewBatch) => Promise<void>;
  getBatch: (id: string) => Promise<Batch | null>;
  batch: Batch | undefined;
  addToCart: (batch: Batch, quantity?: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  removeFromCart: (idBatch: number) => Promise<void>;
  reserveCart: (cart: Batch[], date: Date) => Promise<void>;
  freeSale: (cart: Batch[]) => Promise<void>;
  addRemovedQuantity: (cart: Batch[]) => Promise<void>;
  subRemovedQuantity: (cart: Batch[]) => Promise<void>;
  getUserReservations: () => Promise<Reservation[]>;
  getReservation: () => Promise<ReservationUser[]>;
  getReservationLines: (reservationId: number) => Promise<ReservationLine[]>;
  cancelReservation: (reservationId: number) => Promise<void>;
  changeStatusAsRetrieved: (reservationId: number) => Promise<void>;
  changeStatusAsAbandoned: (reservationId: number) => Promise<void>;
  createProductType: (productType: string) => Promise<void | string>;
  fetchProductTypes: () => Promise<void>;
  productTypes: string[];
  updateProductType: (
    oldLibelle: string,
    newLibelle: string,
  ) => Promise<void | string>;
  updateBatchImage: (idBatch: number, image: File) => Promise<void>;

  updateBatch: (
    idBatch: number,
    status:
      | 'waiting'
      | 'approved'
      | 'refused'
      | 'cancelled'
      | 'available'
      | 'removed',
    reason?: string | null,
  ) => Promise<void>;

  rejectBatch: (idBatch: number, reason: string) => Promise<void>;
  acceptBatch: (idBatch: number) => Promise<void>;
  getBatchSellData: (batchId: string) => Promise<BatchSellData[] | null>;
  batchSellData?: BatchSellData[];
  setBatchSellData?: (data: BatchSellData[]) => void;
  getBatchSellDataYear: (
    batchId: string,
  ) => Promise<BatchSellDataYear[] | null>;
  batchSellDataYear?: BatchSellDataYear[];
  setBatchSellDataYear?: (data: BatchSellDataYear[]) => void;
  updateCartQuantity: (batchId: number, quantity: number) => Promise<void>;
  fetchImagesByProductName: (productName: string) => Promise<string[]>;
}

interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser;
  registerUser: (newUser: RegisterUser) => Promise<void>;
  loginUser: (user: Credential) => Promise<AuthenticatedUser>;
  clearUser: () => void;
  updateToken: () => Promise<void>;
  profilUser: (user: ProfileUser) => Promise<void>;
  updatePassword: (user: updatePassword) => Promise<void>;
  user: ProfileUser | undefined;
}

interface NotificationContextType {
  fetchNotifications: (token: string) => Promise<Notification[]>;
}

interface Batch {
  idBatch?: number;
  receiptDate?: Date;
  quantity?: number;
  pricePerUnit: number;
  producer?: AuthenticatedUser; // producer is the user who created the batch
  product: Product;
  status?: string; // Statut (ex: waiting, Approved, available, refused, removed.)
  image?: File | undefined;
  imageLocation?: string | undefined;
  rejectionReason?: string | null;
  quantityReserved?: number;
  removedQuantity?: number;
  reservedQuantity?: number;
  soldQuantity?: number;
}

interface Product {
  idProduct: number;
  name: string; // name of the product
  productType: ProductType; // Type (ex: fruit, légume, etc.)
  description: string; // Description
  unit: Unit; // Unit (ex: kilo, pièce, litre)
}

interface ProductType {
  libelle: string;
}

interface Unit {
  name: string;
}

type NewBatch = Omit<Batch, 'id'>;

interface RegisterUser {
  honorific: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  company: string;
  address: Address;
}

interface Address {
  street: string;
  number: string;
  box: string;
  postalCode: string;
  city: string;
  country: Country;
}

interface Country {
  name: string;
}

interface Credential {
  email: string;
  password: string;
  StayConnected: boolean;
}

interface AuthenticatedUser {
  email: string;
  firstName: string;
  company?: string;
  role: string;
  token: string;
}

interface ProfileUser {
  token: string;
  honorific: string;
  lastName: string;
  firstName: string;
  address: Address;
  phoneNumber: string;
  email: string;
  password: string;
  role: string;
  company?: string | null;
}

interface updatePassword {
  email?: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ReservationLine {
  idReservationLine: number;
  quantity: number;
  batch: Batch;
  reservation: Reservation;
}

export interface Reservation {
  idReservation: number;
  status: string;
  cart: Array<Batch>;
  recoveryDate: string;
}

interface BatchSellData {
  idProduct: number;
  month: number;
  year: number;
  totalReceivedQuantity: number;
  totalSoldQuantity: number;
}
interface BatchSellDataYear {
  idProduct: number;
  year: number;
  totalReceivedQuantity: number;
  totalSoldQuantity: number;
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined;

interface Notification {
  batchId: number;
  id: number;
  message: string;
  reasonOfReject?: string;
  batch: Batch;
  producer: RegisterUser;
  read: boolean;
  date: Date;
}

type NewNotification = Omit<
  Notification,
  'id' | 'read' | 'date' | 'batch' | 'producer'
> & {
  idbatch: number;
};

type CartItem = {
  batch: Batch;
  quantity: number;
};

type ReservationUser = {
  reservation: Reservation;
  name: string;
  honorific: string;
};

export type {
  CartItem,
  RegisterUser,
  Credential,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  BatchContextType,
  ProfileUser,
  updatePassword,
  Batch,
  Product,
  NewBatch,
  Notification,
  NewNotification,
  NotificationContextType,
  BatchSellData,
  BatchSellDataYear,
  ProductType,
  ReservationUser,
};
