import React from 'react';
import { Link } from 'react-router-dom';

function OrderSuccess() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✅</div>
        <h2 style={styles.title}>Order Placed Successfully!</h2>
        <p style={styles.message}>
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        <div style={styles.buttons}>
          <Link to="/products" style={styles.shopBtn}>Continue Shopping</Link>
          <Link to="/orders" style={styles.ordersBtn}>View My Orders</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  card: { background: '#fff', padding: '50px 40px', borderRadius: '15px', boxShadow: '0 2px 15px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '450px', width: '100%' },
  icon: { fontSize: '60px', marginBottom: '20px' },
  title: { fontSize: '24px', marginBottom: '15px', color: '#333' },
  message: { color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' },
  buttons: { display: 'flex', flexDirection: 'column', gap: '12px' },
  shopBtn: { padding: '12px', background: '#2196F3', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' },
  ordersBtn: { padding: '12px', background: '#fff', color: '#2196F3', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', border: '2px solid #2196F3' },
};

export default OrderSuccess;