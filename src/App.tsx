import React, { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { ProductList } from './components/ProductList';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { PrinterSettings } from './components/PrinterSettings';
import { ReceiptConfig } from './components/ReceiptConfig';
import { useCart } from './hooks/useCart';

type View = 'pos' | 'checkout' | 'printer-settings' | 'receipt-config';

function AppContent() {
  const { cartItems } = useCart();
  const [currentView, setCurrentView] = useState<View>('pos');

  const handleCheckoutComplete = () => {
    setCurrentView('pos');
  };

  return (
    <div className="app min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">POSアプリ</h1>

          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentView('pos')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'pos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              レジ
              {cartItems.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentView('printer-settings')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'printer-settings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              プリンター
            </button>
            <button
              onClick={() => setCurrentView('receipt-config')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'receipt-config'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              レシート設定
            </button>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6">
        {currentView === 'pos' && (
          <div className="pos-view grid md:grid-cols-3 gap-6">
            {/* 商品選択エリア */}
            <div className="md:col-span-2">
              <ProductList />
            </div>

            {/* カートエリア */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl p-4 shadow-sm h-[calc(100vh-200px)] flex flex-col">
                <h2 className="text-lg font-bold mb-4">カート</h2>
                <Cart />

                {/* 会計ボタン */}
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCurrentView('checkout')}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg mt-4 transition-colors"
                  >
                    会計へ進む
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'checkout' && (
          <Checkout onComplete={handleCheckoutComplete} />
        )}

        {currentView === 'printer-settings' && (
          <div className="flex justify-center">
            <PrinterSettings />
          </div>
        )}

        {currentView === 'receipt-config' && (
          <div className="flex justify-center">
            <ReceiptConfig />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
