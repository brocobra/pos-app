import React, { useState } from 'react';
import { useBluetooth } from '../hooks/useBluetooth';

export function PrinterSettings() {
  const { device, isConnected, isAvailable, isIOS, connect, disconnect } = useBluetooth();
  const [isConnecting, setIsConnecting] = useState(false);
  const isIOSDevice = isIOS();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
      alert('プリンターに接続しました');
    } catch (error) {
      alert(`接続エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    alert('プリンターを切断しました');
  };

  return (
    <div className="printer-settings bg-white rounded-xl p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">プリンター設定</h2>

      {/* Bluetooth対応状況 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium">
            {isAvailable ? 'Bluetooth対応' : 'Bluetooth非対応'}
          </span>
        </div>

        {isIOSDevice && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-yellow-800 mb-1">iOSをご利用の場合</p>
            <p className="text-yellow-700">
              iOS SafariはWeb Bluetooth APIをサポートしていないため、直接プリンターに接続できません。
              印刷時はブラウザの印刷ダイアログ（AirPrint対応プリンター）をご利用ください。
            </p>
          </div>
        )}
      </div>

      {/* 接続中のデバイス */}
      {device && (
        <div className="connected-device bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">接続中のプリンター</div>
              <div className="font-medium">{device.name || '不明なデバイス'}</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        {device ? (
          <button
            onClick={handleDisconnect}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            切断する
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={!isAvailable || isConnecting || isIOSDevice}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium"
          >
            {isConnecting ? '接続中...' : 'プリンターを接続'}
          </button>
        )}
      </div>

      {/* 説明 */}
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">対応プリンター</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Star Micronics mPOP / mC-Print3</li>
          <li>EPSON TM-m30 / TM-P80</li>
          <li>その他ESC/POS対応プリンター</li>
        </ul>
      </div>
    </div>
  );
}
