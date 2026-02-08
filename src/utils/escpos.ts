import { CartItem, ReceiptSettings } from '../types';

// ESC/POS コマンド定義
const ESC = '\x1b';
const GS = '\x1d';
const LF = '\x0a';
const SPACE = ' ';

// テキストサイズ
const FONT_SIZE = {
  NORMAL: '\x00',
  DOUBLE_HEIGHT: '\x11',
  DOUBLE_WIDTH: '\x10',
  DOUBLE_BOTH: '\x12',
};

// アラインメント
const ALIGN = {
  LEFT: `${ESC}a\x00`,
  CENTER: `${ESC}a\x01`,
  RIGHT: `${ESC}a\x02`,
};

/**
 * 文字列を指定幅でパディング
 */
function padText(text: string, width: number): string {
  return text.padEnd(width, ' ').slice(0, width);
}

/**
 * 中央揃えテキスト生成
 */
function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return SPACE.repeat(padding) + text;
}

/**
 * レシートデータをESC/POSコマンドに変換
 */
export function generateReceiptCommands(
  items: CartItem[],
  subtotal: number,
  tax: number,
  total: number,
  payment: number,
  change: number,
  settings: ReceiptSettings
): Uint8Array {
  const commands: string[] = [];

  // プリンター初期化
  commands.push(`${ESC}@`);

  // 店舗名（ダブルサイズ・中央揃え）
  commands.push(ALIGN.CENTER);
  commands.push(`${ESC}!${FONT_SIZE.DOUBLE_BOTH}`);
  commands.push(settings.storeName);
  commands.push(LF);
  commands.push(`${ESC}!${FONT_SIZE.NORMAL}`);

  // 電話番号
  if (settings.phoneNumber) {
    commands.push(settings.phoneNumber);
    commands.push(LF);
  }

  // 日時
  const now = new Date();
  commands.push(`${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} `);
  commands.push(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  commands.push(LF);
  commands.push(LF);

  // 区切り線
  commands.push('='.repeat(32));
  commands.push(LF);

  // ヘッダーメッセージ
  if (settings.headerMessage) {
    commands.push(ALIGN.CENTER);
    commands.push(settings.headerMessage);
    commands.push(LF);
    commands.push(ALIGN.LEFT);
    commands.push('='.repeat(32));
    commands.push(LF);
  }

  // 明細
  for (const item of items) {
    const productName = item.product.name;
    const price = item.product.price * item.quantity;
    const quantityText = item.quantity > 1 ? ` x${item.quantity}` : '';

    // 商品名
    commands.push(padText(productName + quantityText, 20));
    // 金額（右寄せ）
    commands.push(padText('', 32 - 20 - String(price).length));
    commands.push(String(price));
    commands.push(LF);
  }

  commands.push('='.repeat(32));
  commands.push(LF);

  // 合計エリア（右揃え）
  commands.push(ALIGN.RIGHT);
  commands.push(`小計     ${subtotal.toLocaleString()}`);
  commands.push(LF);
  commands.push(`消費税   ${tax.toLocaleString()}`);
  commands.push(LF);

  // 合計（ダブルサイズ）
  commands.push(`${ESC}!${FONT_SIZE.DOUBLE_HEIGHT}`);
  commands.push(`合計     ${total.toLocaleString()}`);
  commands.push(LF);
  commands.push(`${ESC}!${FONT_SIZE.NORMAL}`);

  // 預かりとお釣り
  commands.push(`お預かり ${payment.toLocaleString()}`);
  commands.push(LF);
  commands.push(`お釣り   ${change.toLocaleString()}`);
  commands.push(LF);
  commands.push(ALIGN.LEFT);

  // フッター
  commands.push('='.repeat(32));
  commands.push(LF);

  if (settings.footerMessage) {
    commands.push(ALIGN.CENTER);
    commands.push(settings.footerMessage);
    commands.push(LF);
  }

  // 空行とカット
  commands.push(LF);
  commands.push(LF);
  commands.push(LF);
  commands.push(`${GS}V\x01`); // カットコマンド

  // 文字列をUint8Arrayに変換
  const text = commands.join('');
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

/**
 * プリンターで印刷（Web Bluetooth API）
 */
export async function printViaBluetooth(
  commands: Uint8Array,
  device: BluetoothDevice
): Promise<void> {
  const server = await device.gatt?.connect();
  if (!server) {
    throw new Error('GATTサーバーに接続できません');
  }

  // サービスを取得（一般的なプリンターサービス）
  const service = await server.getPrimaryService(
    '000018f0-0000-1000-8000-00805f9b34fb' as BluetoothServiceUUID
  );

  // 書き込みキャラクタリスティックを取得
  const characteristic = await service.getCharacteristic(
    '00002af1-0000-1000-8000-00805f9b34fb' as BluetoothCharacteristicUUID
  );

  // データを送信
  await characteristic.writeValue(commands);
}

/**
 * ブラウザ印刷ダイアログ用のHTML生成（iOS用）
 */
export function generateReceiptHTML(
  items: CartItem[],
  subtotal: number,
  tax: number,
  total: number,
  payment: number,
  change: number,
  settings: ReceiptSettings
): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>レシート</title>
  <style>
    @media print {
      body { font-family: 'Courier New', monospace; font-size: 12px; width: 58mm; margin: 0; padding: 0; }
      .header { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 5px; }
      .date { text-align: center; margin-bottom: 10px; }
      .divider { border-top: 1px dashed #000; margin: 5px 0; }
      .message { text-align: center; font-size: 11px; margin: 5px 0; }
      .items { margin: 5px 0; }
      .item { display: flex; justify-content: space-between; }
      .total-section { text-align: right; margin-top: 10px; }
      .total { font-size: 18px; font-weight: bold; }
      .footer { text-align: center; font-size: 11px; margin-top: 15px; }
      .no-print { display: none; }
    }
    @media screen {
      body { font-family: sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
      .header { text-align: center; font-size: 18px; font-weight: bold; }
      .date { text-align: center; color: #666; }
      .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
      .message { text-align: center; color: #666; font-size: 12px; }
      .items { margin: 15px 0; }
      .item { display: flex; justify-content: space-between; padding: 5px 0; }
      .total-section { text-align: right; margin-top: 15px; }
      .total { font-size: 20px; font-weight: bold; }
      .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      button { width: 100%; padding: 15px; font-size: 16px; margin-top: 20px; background: #007AFF; color: white; border: none; border-radius: 8px; cursor: pointer; }
    }
  </style>
</head>
<body>
  <div class="header">${settings.storeName}</div>
  <div class="date">${dateStr}</div>
  ${settings.phoneNumber ? `<div class="date">${settings.phoneNumber}</div>` : ''}

  <div class="divider"></div>

  ${settings.headerMessage ? `<div class="message">${settings.headerMessage}</div><div class="divider"></div>` : ''}

  <div class="items">
    ${items.map(item => `
      <div class="item">
        <span>${item.product.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}</span>
        <span>¥${(item.product.price * item.quantity).toLocaleString()}</span>
      </div>
    `).join('')}
  </div>

  <div class="divider"></div>

  <div class="total-section">
    <div>小計: ¥${subtotal.toLocaleString()}</div>
    <div>消費税: ¥${tax.toLocaleString()}</div>
    <div class="total">合計: ¥${total.toLocaleString()}</div>
    <div>お預かり: ¥${payment.toLocaleString()}</div>
    <div>お釣り: ¥${change.toLocaleString()}</div>
  </div>

  <div class="divider"></div>

  ${settings.footerMessage ? `<div class="footer">${settings.footerMessage}</div>` : ''}

  <button class="no-print" onclick="window.print()">印刷</button>
</body>
</html>
  `;
}
