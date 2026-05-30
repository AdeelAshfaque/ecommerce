import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';
import { isAdmin } from '../../auth';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/');
      setOrders(res.data);
    } catch {
      setError('Failed to load orders');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status?status=${status}`);
      setSuccess(`Order status updated to ${status}`);
      fetchOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'shipped': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>⚙️ Admin Panel</h2>
        <div style={styles.navLinks}>
          <Link to="/admin/products" style={styles.navLink}>Products</Link>
          <Link to="/products" style={styles.navLink}>View Store</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.body}>
        <h3 style={styles.heading}>Orders Management</h3>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <h4 style={styles.statNumber}>{orders.length}</h4>
            <p style={styles.statLabel}>Total Orders</p>
          </div>
          <div style={styles.statCard}>
            <h4 style={styles.statNumber}>{orders.filter(o => o.status === 'pending').length}</h4>
            <p style={styles.statLabel}>Pending</p>
          </div>
          <div style={styles.statCard}>
            <h4 style={styles.statNumber}>{orders.filter(o => o.status === 'delivered').length}</h4>
            <p style={styles.statLabel}>Delivered</p>
          </div>
          <div style={styles.statCard}>
            <h4 style={{ ...styles.statNumber, color: '#4CAF50' }}>
              ${orders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toFixed(2)}
            </h4>
            <p style={styles.statLabel}>Total Revenue</p>
          </div>
        </div>

        <div style={styles.list}>
          {orders.length === 0 && !error && <p style={styles.empty}>No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.orderId}>Order #{o.id.slice(-6).toUpperCase()}</span>
                  <span style={styles.date}>{new Date(o.created_at).toLocaleString()}</span>
                </div>
                <span style={{ ...styles.status, background: getStatusColor(o.status) }}>
                  {o.status.toUpperCase()}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.orderInfo}>
                  <p style={styles.detail}><strong>Address:</strong> {o.shipping_address}</p>
                  {o.guest_email && <p style={styles.detail}><strong>Guest Email:</strong> {o.guest_email}</p>}
                  {o.user_id && <p style={styles.detail}><strong>User ID:</strong> {o.user_id}</p>}
                </div>

                <div style={styles.items}>
                  {o.items && o.items.map((item, index) => (
                    <div key={index} style={styles.itemRow}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={styles.totalRow}>
                    <strong>Total: ${o.total_amount?.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.updateLabel}>Update Status:</span>
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                  <button
                    key={s}
                    style={{
                      ...styles.statusBtn,
                      background: o.status === s ? getStatusColor(s) : '#f0f0f0',
                      color: o.status === s ? '#fff' : '#555',
                    }}
                    onClick={() => handleStatusUpdate(o.id, s)}
                  >
                    {s}
                  </button>
                ))}
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
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a2e', padding: '15px 30px' },
  logo: { margin: 0, color: '#fff' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  navLink: { color: '#fff', textDecoration: 'none', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  body: { padding: '30px' },
  heading: { marginBottom: '20px', fontSize: '22px' },
  error: { color: 'red', marginBottom: '10px' },
  success: { color: 'green', marginBottom: '10px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px' },
  statCard: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' },
  statNumber: { margin: '0 0 5px', fontSize: '28px', color: '#2196F3' },
  statLabel: { margin: 0, color: '#999', fontSize: '13px' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
  card: { background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f0f0f0' },
  orderId: { fontWeight: 'bold', fontSize: '16px', marginRight: '15px' },
  date: { color: '#999', fontSize: '13px' },
  status: { padding: '5px 12px', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: 'bold' },
  cardBody: { padding: '15px 20px', display: 'flex', gap: '20px', flexWrap: 'wrap' },
  orderInfo: { flex: 1, minWidth: '200px' },
  detail: { margin: '5px 0', color: '#555', fontSize: '14px' },
  items: { flex: 1, minWidth: '200px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#555', fontSize: '14px' },
  totalRow: { borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '5px', textAlign: 'right' },
  cardFooter: { padding: '12px 20px', background: '#f8f9fa', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  updateLabel: { color: '#555', fontSize: '13px', fontWeight: 'bold', marginRight: '5px' },
  statusBtn: { padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' },
};

export default AdminOrders;