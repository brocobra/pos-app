import { useApp } from '../store/AppContext';
import { Product } from '../types';

export function useProducts() {
  const { products, isLoading } = useApp();

  const getProductsByCategory = (category: string) => {
    if (category === 'すべて') {
      return products;
    }
    return products.filter((p) => p.category === category);
  };

  const getProductById = (id: number) => {
    return products.find((p) => p.id === id);
  };

  return {
    products,
    isLoading,
    getProductsByCategory,
    getProductById,
  };
}
