import React, { useState } from 'react';
import { useProducts, useCart } from '../hooks';
import { CATEGORIES } from '../utils/constants';
import { Product } from '../types';

export function ProductList() {
  const { products, getProductsByCategory } = useProducts();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  const filteredProducts = getProductsByCategory(selectedCategory);

  const handleProductClick = (product: Product) => {
    addToCart(product);
  };

  return (
    <div className="product-list">
      {/* カテゴリーフィルター */}
      <div className="category-filter flex gap-2 overflow-x-auto pb-3 mb-4">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 商品グリッド */}
      <div className="products-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className={`${product.color} text-white p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all active:scale-95`}
          >
            <div className="text-lg font-bold mb-1">{product.name}</div>
            <div className="text-2xl font-bold">¥{product.price.toLocaleString()}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
