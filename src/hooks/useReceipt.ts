import { useCallback } from 'react';
import { CartItem, ReceiptSettings } from '../types';
import { generateReceiptCommands, printViaBluetooth, generateReceiptHTML } from '../utils/escpos';
import { useBluetooth } from './useBluetooth';

export function useReceipt() {
  const { device, isConnected, isIOS, connect } = useBluetooth();

  // Bluetoothで印刷
  const printBluetooth = useCallback(async (
    items: CartItem[],
    subtotal: number,
    tax: number,
    total: number,
    payment: number,
    change: number,
    settings: ReceiptSettings
  ): Promise<void> => {
    // iOSの場合はBluetooth印刷は使用できない
    if (isIOS()) {
      throw new Error('iOSではBluetooth印刷は使用できません。印刷ダイアログを使用してください。');
    }

    // デバイスに接続されていない場合は接続
    let targetDevice = device;
    if (!targetDevice || !isConnected) {
      targetDevice = await connect();
      if (!targetDevice) {
        throw new Error('プリンターに接続できませんでした');
      }
    }

    // ESC/POSコマンドを生成
    const commands = generateReceiptCommands(
      items,
      subtotal,
      tax,
      total,
      payment,
      change,
      settings
    );

    // 印刷実行
    await printViaBluetooth(commands, targetDevice);
  }, [device, isConnected, isIOS, connect]);

  // ブラウザ印刷ダイアログを表示（iOS用）
  const printBrowser = useCallback((
    items: CartItem[],
    subtotal: number,
    tax: number,
    total: number,
    payment: number,
    change: number,
    settings: ReceiptSettings
  ): void => {
    // HTMLを生成
    const html = generateReceiptHTML(
      items,
      subtotal,
      tax,
      total,
      payment,
      change,
      settings
    );

    // 新しいウィンドウで印刷
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();

      // 印刷ダイアログを表示
      setTimeout(() => {
        printWindow.print();
        // 印刷後にウィンドウを閉じる（オプション）
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 250);
    }
  }, []);

  return {
    printBluetooth,
    printBrowser,
  };
}
