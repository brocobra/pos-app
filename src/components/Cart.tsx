import React from 'react';
import { useCart } from '../hooks/useCart';

export function Cart() {
  const { cartItems, subtotal, tax, total, removeFromCart, updateQuantity } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p>カートは空です</p>
      </div>
    );
  }

  return (
    <div className="cart flex flex-col h-full">
      {/* カートアイテムリスト */}
      <div className="cart-items flex-1 overflow-y-auto space-y-2">
        {cartItems.map((item) => (
          <div
            key={item.productId}
            className="cart-item bg-white rounded-lg p-3 shadow-sm flex items-center gap-3"
          >
            <div className="flex-1">
              <div className="font-medium">{item.product.name}</div>
              <div className="text-sm text-gray-500">
                ¥{item.product.price.toLocaleString()}
              </div>
            </div>

            {/* 数量コントロール */}
            <div className="quantity-control flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>

            <div className="text-right font-medium min-w-[80px]">
              ¥{(item.product.price * item.quantity).toLocaleString()}
            </div>

            <button
              onClick={() => removeFromCart(item.productId)}
              className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 合計エリア */}
      <div className="cart-total bg-white rounded-lg p-4 shadow-sm mt-4">
        <div className="flex justify-between mb-2 text-gray-600">
          <span>小計</span>
          <span>¥{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2 text-gray-600">
          <span>消費税</span>
          <span>¥{tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
          <span>合計</span>
          <span className="text-blue-600">¥{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
