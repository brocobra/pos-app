// 商品データ型
export interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  color: string;
  sortOrder: number;
}

// カートアイテム型
export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
}

// レシート設定型
export interface ReceiptSettings {
  id?: number;
  storeName: string;
  phoneNumber: string;
  headerMessage: string;
  footerMessage: string;
  fontSizeTitle: number;
  fontSizeBody: number;
  fontSizeTotal: number;
}

// 売上データ型
export interface Sale {
  id?: number;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment: number;
  change: number;
}

// プリンター型
export interface PrinterDevice {
  id: string;
  name: string;
}

// アプリコンテキスト型
export interface AppContextType {
  products: Product[];
  cartItems: CartItem[];
  receiptSettings: ReceiptSettings;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void;
  saveSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  isLoading: boolean;
}
