import React, { useState, useCallback } from 'react';
import { useCart, useReceipt } from '../hooks';
import { useApp } from '../store/AppContext';
import { Sale } from '../types';

interface CheckoutProps {
  onComplete: () => void;
}

export function Checkout({ onComplete }: CheckoutProps) {
  const { cartItems, subtotal, tax, total, clearCart } = useCart();
  const { receiptSettings, saveSale } = useApp();
  const { printBrowser, printBluetooth } = useReceipt();
  const [payment, setPayment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const change = payment ? parseInt(payment) - total : 0;

  // 会計完了処理
  const handleComplete = useCallback(async () => {
    if (!payment || parseInt(payment) < total) {
      alert('お預かり金額を入力してください');
      return;
    }

    setIsProcessing(true);

    const paymentAmount = parseInt(payment);
    const changeAmount = paymentAmount - total;

    // 売上データを保存
    const sale: Omit<Sale, 'id'> = {
      date: new Date().toISOString(),
      items: cartItems,
      subtotal,
      tax,
      total,
      payment: paymentAmount,
      change: changeAmount,
    };

    await saveSale(sale);

    // レシートプレビューを表示
    setShowReceipt(true);
    setIsProcessing(false);
  }, [cartItems, subtotal, tax, total, payment, saveSale]);

  // 印刷処理
  const handlePrint = useCallback(async () => {
    const paymentAmount = parseInt(payment);
    const changeAmount = paymentAmount - total;

    // iOSの場合はブラウザ印刷、それ以外はBluetoothを試みる
    try {
      await printBluetooth(
        cartItems,
        subtotal,
        tax,
        total,
        paymentAmount,
        changeAmount,
        receiptSettings
      );
    } catch (error) {
      // Bluetooth失敗時はブラウザ印刷にフォールバック
      console.log('Bluetooth印刷に失敗しました。ブラウザ印刷を使用します。', error);
      printBrowser(
        cartItems,
        subtotal,
        tax,
        total,
        paymentAmount,
        changeAmount,
        receiptSettings
      );
    }

    // カートをクリアして完了
    clearCart();
    setShowReceipt(false);
    setPayment('');
    onComplete();
  }, [cartItems, subtotal, tax, total, payment, receiptSettings, printBluetooth, printBrowser, clearCart, onComplete]);

  // 印刷せずに完了
  const handleSkipPrint = useCallback(() => {
    clearCart();
    setShowReceipt(false);
    setPayment('');
    onComplete();
  }, [clearCart, onComplete]);

  if (showReceipt) {
    return (
      <div className="checkout-receipt bg-white rounded-xl p-6 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">お会計完了</h2>

        <div className="receipt-preview bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm">
          <div className="text-center font-bold text-lg mb-2">{receiptSettings.storeName}</div>
          <div className="text-center text-gray-500 text-xs mb-4">
            {new Date().toLocaleString('ja-JP')}
          </div>

          <div className="border-t border-dashed border-gray-300 mb-2"></div>

          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between mb-1">
              <span>{item.product.name} x{item.quantity}</span>
              <span>¥{(item.product.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}

          <div className="border-t border-dashed border-gray-300 my-2"></div>

          <div className="flex justify-between mb-1">
            <span>小計</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>消費税</span>
            <span>¥{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>合計</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>お預かり</span>
            <span>¥{parseInt(payment).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-1 text-blue-600">
            <span>お釣り</span>
            <span>¥{change.toLocaleString()}</span>
          </div>

          <div className="border-t border-dashed border-gray-300 mt-2 mb-2"></div>

          {receiptSettings.footerMessage && (
            <div className="text-center text-xs text-gray-500">
              {receiptSettings.footerMessage}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkipPrint}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
          >
            印刷しない
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            印刷する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout bg-white rounded-xl p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">お会計</h2>

      {/* 合計表示 */}
      <div className="total-display text-center mb-8">
        <div className="text-gray-600 mb-2">合計金額</div>
        <div className="text-5xl font-bold text-blue-600">¥{total.toLocaleString()}</div>
      </div>

      {/* お預かり金額入力 */}
      <div className="payment-input mb-6">
        <label className="block text-gray-700 font-medium mb-2">お預かり金額</label>
        <div className="flex items-center gap-2">
          <span className="text-2xl">¥</span>
          <input
            type="number"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="flex-1 text-3xl font-bold p-3 border-2 rounded-lg text-center"
            placeholder="0"
            autoFocus
          />
        </div>
      </div>

      {/* お釣り表示 */}
      {payment && parseInt(payment) >= total && (
        <div className="change-display bg-green-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">お釣り</span>
            <span className="text-3xl font-bold text-green-600">
              ¥{change.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* クイック入力ボタン */}
      <div className="quick-buttons grid grid-cols-3 gap-2 mb-6">
        {[
          { label: '¥1,000', value: 1000 },
          { label: '¥2,000', value: 2000 },
          { label: '¥5,000', value: 5000 },
          { label: '¥10,000', value: 10000 },
        ].map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setPayment(String(value))}
            className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setPayment(String(Math.ceil(total / 1000) * 1000))}
          className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium"
        >
          切り上げ
        </button>
        <button
          onClick={() => setPayment('')}
          className="py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium"
        >
          クリア
        </button>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={onComplete}
          className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
        >
          戻る
        </button>
        <button
          onClick={handleComplete}
          disabled={!payment || parseInt(payment) < total || isProcessing}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium"
        >
          {isProcessing ? '処理中...' : '会計完了'}
        </button>
      </div>
    </div>
  );
}
