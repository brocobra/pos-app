import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { liveQuery } from 'dexie';
import { db } from './db';
import { Product, CartItem, ReceiptSettings, Sale, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    storeName: 'サンプル店舗',
    phoneNumber: '03-1234-5678',
    headerMessage: 'ありがとうございます',
    footerMessage: 'またのご来店をお待ちしております',
    fontSizeTitle: 2,
    fontSizeBody: 1,
    fontSizeTotal: 2,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 商品データを購読
  useEffect(() => {
    const subscription = liveQuery(() => db.products.toArray()).subscribe({
      next: (items) => {
        setProducts(items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
        setIsLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, []);

  // レシート設定を取得
  useEffect(() => {
    db.getReceiptSettings().then(setSettings);
  }, []);

  // カートに商品を追加
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id!, product, quantity: 1 }];
    });
  };

  // カートから商品を削除
  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // 数量を更新
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // カートをクリア
  const clearCart = () => {
    setCartItems([]);
  };

  // レシート設定を更新
  const updateReceiptSettings = async (settings: Partial<ReceiptSettings>) => {
    const newSettings = { ...receiptSettings, ...settings };
    setReceiptSettings(newSettings);
    await db.updateReceiptSettings(newSettings);
  };

  // 売上を保存
  const saveSale = async (sale: Omit<Sale, 'id'>) => {
    await db.sales.add(sale as Sale);
  };

  const setSettings = (settings: ReceiptSettings) => {
    setReceiptSettings(settings);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cartItems,
        receiptSettings,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        updateReceiptSettings,
        saveSale,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
