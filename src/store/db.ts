import Dexie, { Table } from 'dexie';
import { Product, ReceiptSettings, Sale } from '../types';

// 初期レシート設定
const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  storeName: 'サンプル店舗',
  phoneNumber: '03-1234-5678',
  headerMessage: 'ありがとうございます',
  footerMessage: 'またのご来店をお待ちしております',
  fontSizeTitle: 2,
  fontSizeBody: 1,
  fontSizeTotal: 2,
};

// 初期商品データ
const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'コーヒー', price: 350, category: 'ドリンク', color: 'bg-amber-600', sortOrder: 1 },
  { id: 2, name: '紅茶', price: 300, category: 'ドリンク', color: 'bg-orange-600', sortOrder: 2 },
  { id: 3, name: 'オレンジジュース', price: 400, category: 'ドリンク', color: 'bg-orange-500', sortOrder: 3 },
  { id: 4, name: 'サンドイッチ', price: 500, category: 'フード', color: 'bg-yellow-600', sortOrder: 4 },
  { id: 5, name: 'ハンバーガー', price: 600, category: 'フード', color: 'bg-red-600', sortOrder: 5 },
  { id: 6, name: 'フライドポテト', price: 350, category: 'フード', color: 'bg-yellow-500', sortOrder: 6 },
  { id: 7, name: 'ケーキ', price: 450, category: 'デザート', color: 'bg-pink-600', sortOrder: 7 },
  { id: 8, name: 'アイスクリーム', price: 300, category: 'デザート', color: 'bg-pink-500', sortOrder: 8 },
  { id: 9, name: 'パフェ', price: 550, category: 'デザート', color: 'bg-purple-600', sortOrder: 9 },
];

class POSDatabase extends Dexie {
  products!: Table<Product>;
  receiptSettings!: Table<ReceiptSettings>;
  sales!: Table<Sale>;

  constructor() {
    super('POSDatabase');

    this.version(1).stores({
      products: '++id, name, category, sortOrder',
      receiptSettings: '++id',
      sales: '++id, date',
    });
  }

  // 初期データをセットアップ
  async initializeData() {
    const productCount = await this.products.count();
    if (productCount === 0) {
      await this.products.bulkAdd(INITIAL_PRODUCTS);
    }

    const settingsCount = await this.receiptSettings.count();
    if (settingsCount === 0) {
      await this.receiptSettings.add(DEFAULT_RECEIPT_SETTINGS);
    }
  }

  // レシート設定を取得
  async getReceiptSettings(): Promise<ReceiptSettings> {
    const settings = await this.receiptSettings.limit(1).first();
    return settings || DEFAULT_RECEIPT_SETTINGS;
  }

  // レシート設定を更新
  async updateReceiptSettings(settings: ReceiptSettings): Promise<void> {
    const id = await this.receiptSettings.limit(1).first().then(s => s?.id);
    if (id) {
      await this.receiptSettings.update(id, settings);
    } else {
      await this.receiptSettings.add(settings);
    }
  }
}

export const db = new POSDatabase();

// データベースを初期化
db.initializeData();
