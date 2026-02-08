import { useApp } from '../store/AppContext';
import { TAX_RATE } from '../utils/constants';

export function useCart() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useApp();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = Math.floor(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    cartItems,
    subtotal,
    tax,
    total,
    itemCount: getItemCount(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
