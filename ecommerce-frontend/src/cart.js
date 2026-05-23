export const getCart = () => {
  return JSON.parse(localStorage.getItem('cart') || '[]');
};

export const addToCart = (product) => {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const clearCart = () => {
  localStorage.removeItem('cart');
};