import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, removeFromCart, clearCart } from '../cart';

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleRemove = (productId) => {
    removeFromCart(productId);
    setCart(getCart());
  };

  const handleClear = () => {
    clearCart();
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🛒 Ecommerce</h2>
        <Link to="/products" style={styles.navLink}>← Back to Products</Link>
      </div>

      <div style={styles.body}>
        <h3 style={styles.heading}>Your Cart</h3>

        {cart.length === 0 ? (
          <div style={styles.empty}>
            <p>Your cart is empty.</p>
            <Link to="/products" style={styles.shopLink}>Start Shopping →</Link>
          </div>
        ) : (
          <>
            <div style={styles.list}>
              {cart.map((item) => (
                <div key={item.id} style={styles.card}>
                  <div style={styles.cardLeft}>
                    <h4 style={styles.productName}>{item.name}</h4>
                    <p style={styles.desc}>{item.description}</p>
                    <p style={styles.price}>${item.price} x {item.quantity} = <strong>${item.price * item.quantity}</strong></p>
                  </div>
                  <button style={styles.removeBtn} onClick={() => handleRemove(item.id)}>✕ Remove</button>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <h3>Total: ${total.toFixed(2)}</h3>
              <div style={styles.summaryBtns}>
                <button style={styles.clearBtn} onClick={handleClear}>Clear Cart</button>
                <button style={styles.checkoutBtn} onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  logo: { margin: 0 },
  navLink: { color: '#2196F3', textDecoration: 'none', fontWeight: 'bold' },
  body: { padding: '30px', maxWidth: '800px', margin: '0 auto' },
  heading: { marginBottom: '20px', fontSize: '22px' },
  empty: { textAlign: 'center', marginTop: '60px' },
  shopLink: { color: '#2196F3', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flex: 1 },
  productName: { margin: '0 0 5px', fontSize: '18px' },
  desc: { color: '#666', fontSize: '13px', margin: '0 0 5px' },
  price: { margin: 0, color: '#555' },
  removeBtn: { padding: '8px 14px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  summary: { background: '#fff', padding: '20px', borderRadius: '10px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  summaryBtns: { display: 'flex', justifyContent: 'space-between', marginTop: '15px' },
  clearBtn: { padding: '10px 20px', background: '#999', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  checkoutBtn: { padding: '10px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '15px' },
};

export default Cart;