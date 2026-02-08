import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ReceiptSettings } from '../types';

export function ReceiptConfig() {
  const { receiptSettings, updateReceiptSettings } = useApp();
  const [settings, setSettings] = useState<ReceiptSettings>(receiptSettings);

  const handleChange = (field: keyof ReceiptSettings, value: string | number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateReceiptSettings(settings);
    alert('設定を保存しました');
  };

  const handleReset = () => {
    const defaultSettings: ReceiptSettings = {
      storeName: 'サンプル店舗',
      phoneNumber: '03-1234-5678',
      headerMessage: 'ありがとうございます',
      footerMessage: 'またのご来店をお待ちしております',
      fontSizeTitle: 2,
      fontSizeBody: 1,
      fontSizeTotal: 2,
    };
    setSettings(defaultSettings);
    updateReceiptSettings(defaultSettings);
    alert('設定をリセットしました');
  };

  return (
    <div className="receipt-config bg-white rounded-xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">レシート設定</h2>

      <div className="space-y-4">
        {/* 店舗名 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">店舗名</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => handleChange('storeName', e.target.value)}
            className="w-full p-3 border rounded-lg"
            maxLength={20}
          />
        </div>

        {/* 電話番号 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">電話番号</label>
          <input
            type="tel"
            value={settings.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="03-1234-5678"
          />
        </div>

        {/* ヘッダーメッセージ */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">ヘッダーメッセージ</label>
          <input
            type="text"
            value={settings.headerMessage}
            onChange={(e) => handleChange('headerMessage', e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="ありがとうございます"
            maxLength={30}
          />
        </div>

        {/* フッターメッセージ */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">フッターメッセージ</label>
          <textarea
            value={settings.footerMessage}
            onChange={(e) => handleChange('footerMessage', e.target.value)}
            className="w-full p-3 border rounded-lg"
            rows={3}
            placeholder="またのご来店をお待ちしております"
            maxLength={100}
          />
        </div>

        {/* フォントサイズ設定 */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">フォントサイズ（Bluetooth印刷時）</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">タイトル</label>
              <select
                value={settings.fontSizeTitle}
                onChange={(e) => handleChange('fontSizeTitle', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              >
                <option value={1}>標準</option>
                <option value={2}>大きい</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">本文</label>
              <select
                value={settings.fontSizeBody}
                onChange={(e) => handleChange('fontSizeBody', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              >
                <option value={1}>標準</option>
                <option value={2}>大きい</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">合計</label>
              <select
                value={settings.fontSizeTotal}
                onChange={(e) => handleChange('fontSizeTotal', parseInt(e.target.value))}
                className="w-full p-2 border rounded-lg"
              >
                <option value={1}>標準</option>
                <option value={2}>大きい</option>
              </select>
            </div>
          </div>
        </div>

        {/* プレビュー */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center font-bold text-lg">{settings.storeName}</div>
          {settings.phoneNumber && (
            <div className="text-center text-sm text-gray-600">{settings.phoneNumber}</div>
          )}
          <div className="text-center text-xs text-gray-500 my-2">
            {new Date().toLocaleString('ja-JP')}
          </div>
          <div className="border-t border-dashed border-gray-300 my-2"></div>
          {settings.headerMessage && (
            <div className="text-center text-sm">{settings.headerMessage}</div>
          )}
          <div className="border-t border-dashed border-gray-300 my-2"></div>
          <div className="text-sm">商品名 ×数量 ... 金額</div>
          <div className="border-t border-dashed border-gray-300 my-2"></div>
          <div className="flex justify-between text-lg font-bold">
            <span>合計</span>
            <span>¥1,000</span>
          </div>
          <div className="border-t border-dashed border-gray-300 my-2"></div>
          {settings.footerMessage && (
            <div className="text-center text-xs text-gray-500">{settings.footerMessage}</div>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleReset}
          className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
        >
          リセット
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          保存
        </button>
      </div>
    </div>
  );
}
