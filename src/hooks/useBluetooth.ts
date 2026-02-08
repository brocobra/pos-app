import { useState, useCallback } from 'react';
import { PrinterDevice } from '../types';

// Web Bluetooth APIが利用可能かチェック
const isBluetoothAvailable = (): boolean => {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
};

export function useBluetooth() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // プリンターをスキャンして接続
  const connect = useCallback(async (): Promise<BluetoothDevice | null> => {
    if (!isBluetoothAvailable()) {
      throw new Error('このブラウザはBluetoothをサポートしていません');
    }

    setIsScanning(true);

    try {
      // Bluetoothデバイスをスキャン
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [
          // 一般的なプリンターサービス
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
          // Serial Port Service（多くのプリンターが対応）
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
      });

      setDevice(bluetoothDevice);
      setIsConnected(true);
      setIsScanning(false);

      // デバイス切断を監視
      bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
      });

      return bluetoothDevice;
    } catch (error) {
      setIsScanning(false);
      throw error;
    }
  }, []);

  // デバイスに接続（GATTサーバー）
  const connectGatt = useCallback(async (): Promise<void> => {
    if (!device) {
      throw new Error('デバイスが選択されていません');
    }

    try {
      const server = await device.gatt?.connect();
      if (server) {
        setIsConnected(true);
      }
    } catch (error) {
      setIsConnected(false);
      throw error;
    }
  }, [device]);

  // 切断
  const disconnect = useCallback(() => {
    device?.gatt?.disconnect();
    setIsConnected(false);
  }, [device]);

  // iOSかどうかを判定
  const isIOS = useCallback((): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  return {
    device,
    isConnected,
    isScanning,
    isAvailable: isBluetoothAvailable(),
    isIOS,
    connect,
    connectGatt,
    disconnect,
  };
}
