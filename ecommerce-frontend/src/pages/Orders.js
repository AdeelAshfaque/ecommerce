import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { getUserId, getUserEmail } from '../auth';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = getUserId();
  const userEmail = getUserEmail();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get(`/orders/user/${userId}`);
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🛒 Ecommerce</h2>
        <div style={styles.navLinks}>
          <Link to="/products" style={styles.navLink}>Products</Link>
          <Link to="/cart" style={styles.navLink}>🛒 Cart</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Profile Section */}
      <div style={styles.profile}>
        <div style={styles.avatar}>{userEmail ? userEmail[0].toUpperCase() : 'U'}</div>
        <div>
          <p style={styles.profileEmail}>{userEmail}</p>
          <p style={styles.profileSub}>Member Account</p>
        </div>
      </div>

      <div style={styles.body}>
        <h3 style={styles.heading}>My Orders</h3>
        {error && <p style={styles.error}>{error}</p>}
        {orders.length === 0 && !error && (
          <div style={styles.empty}>
            <p>You have no orders yet.</p>
            <Link to="/products" style={styles.shopLink}>Start Shopping →</Link>
          </div>
        )}
        <div style={styles.list}>
          {orders.map((o) => (
            <div key={o.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.orderId}>Order #{o.id.slice(-6).toUpperCase()}</span>
                <span style={{ ...styles.status, color: getStatusColor(o.status) }}>
                  ● {o.status.toUpperCase()}
                </span>
              </div>
              <div style={styles.cardBody}>
                {o.items && o.items.map((item, index) => (
                  <div key={index} style={styles.itemRow}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={styles.divider} />
                <div style={styles.totalRow}>
                  <strong>Total</strong>
                  <strong>${o.total_amount?.toFixed(2)}</strong>
                </div>
                <p style={styles.detail}><strong>Address:</strong> {o.shipping_address}</p>
                <p style={styles.detail}><strong>Date:</strong> {new Date(o.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  logo: { margin: 0 },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  navLink: { color: '#2196F3', textDecoration: 'none', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  profile: { display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '20px 30px', borderBottom: '1px solid #eee' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', background: '#2196F3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' },
  profileEmail: { margin: 0, fontWeight: 'bold', fontSize: '16px' },
  profileSub: { margin: 0, color: '#999', fontSize: '13px' },
  body: { padding: '30px', maxWidth: '800px', margin: '0 auto' },
  heading: { marginBottom: '20px', fontSize: '22px' },
  error: { color: 'red' },
  empty: { textAlign: 'center', marginTop: '60px' },
  shopLink: { color: '#2196F3', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f0f0f0' },
  orderId: { fontWeight: 'bold', fontSize: '16px' },
  status: { fontWeight: 'bold', fontSize: '14px' },
  cardBody: { padding: '15px 20px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#555' },
  divider: { height: '1px', background: '#f0f0f0', margin: '10px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginBottom: '10px' },
  detail: { margin: '5px 0', color: '#777', fontSize: '13px' },
};

export default Orders;