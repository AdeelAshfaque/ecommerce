import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, clearCart } from '../cart';
import API from '../api';
import { getUserId } from '../auth';

function Checkout() {
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1); // 1 = shipping, 2 = payment, 3 = processing
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [shipping, setShipping] = useState({
    fullName: '', phone: '', address: '', city: '', country: '', email: ''
  });

  const [payment, setPayment] = useState({
    cardNumber: '', expiry: '', cvv: '', cardName: ''
  });

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (e.target.name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }
    setPayment({ ...payment, [e.target.name]: value });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const { fullName, phone, address, city, country } = shipping;
    if (!fullName || !phone || !address || !city || !country) {
      setError('Please fill all shipping fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const { cardNumber, expiry, cvv, cardName } = payment;
    if (!cardNumber || !expiry || !cvv || !cardName) {
      setError('Please fill all payment fields');
      return;
    }
    setError('');
    setStep(3);

    // simulate processing delay
    setTimeout(async () => {
      try {
        const items = cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }));

        const fullAddress = `${shipping.address}, ${shipping.city}, ${shipping.country}`;

await API.post('/orders/', {
  user_id: getUserId() || null,
  guest_email: token ? null : shipping.email,
  items: items,
  shipping_address: fullAddress,
});

        clearCart();
        navigate('/order-success');
      } catch (err) {
        setStep(2);
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          setError(detail.map(d => d.msg).join(', '));
        } else {
          setError('Failed to place order. Try again.');
        }
      }
    }, 3000);
  };

  if (cart.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.body}>
          <p>Your cart is empty. <Link to="/products">Go shopping</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🛒 Ecommerce</h2>
        <Link to="/cart" style={styles.navLink}>← Back to Cart</Link>
      </div>

      <div style={styles.body}>

        {/* Steps indicator */}
        <div style={styles.steps}>
          <div style={{ ...styles.step, color: step >= 1 ? '#2196F3' : '#999' }}>① Shipping</div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.step, color: step >= 2 ? '#2196F3' : '#999' }}>② Payment</div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.step, color: step >= 3 ? '#2196F3' : '#999' }}>③ Confirm</div>
        </div>

        {/* Order Summary */}
        <div style={styles.summary}>
          <h4 style={styles.sectionTitle}>Order Summary</h4>
          {cart.map(item => (
            <div key={item.id} style={styles.summaryRow}>
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={styles.totalRow}>
            <strong>Total</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Step 1 - Shipping */}
        {step === 1 && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>📦 Shipping Details</h4>
            <form onSubmit={handleShippingSubmit}>
              <input style={styles.input} name="fullName" placeholder="Full Name" value={shipping.fullName} onChange={handleShippingChange} />
{!token && (
    <input style={styles.input} name="email" placeholder="Email (for order updates)" value={shipping.email} onChange={handleShippingChange} />
)}
              <input style={styles.input} name="phone" placeholder="Phone Number" value={shipping.phone} onChange={handleShippingChange} />
              <input style={styles.input} name="address" placeholder="Street Address" value={shipping.address} onChange={handleShippingChange} />
              <div style={styles.row}>
                <input style={{ ...styles.input, flex: 1, marginRight: '10px' }} name="city" placeholder="City" value={shipping.city} onChange={handleShippingChange} />
                <input style={{ ...styles.input, flex: 1 }} name="country" placeholder="Country" value={shipping.country} onChange={handleShippingChange} />
              </div>
              <button style={styles.primaryBtn} type="submit">Continue to Payment →</button>
            </form>
          </div>
        )}

        {/* Step 2 - Payment */}
        {step === 2 && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>💳 Payment Details</h4>
            <div style={styles.cardPreview}>
              <div style={styles.cardChip}>▮▮▮</div>
              <div style={styles.cardNumberPreview}>
                {payment.cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div style={styles.cardBottom}>
                <span>{payment.cardName || 'YOUR NAME'}</span>
                <span>{payment.expiry || 'MM/YY'}</span>
              </div>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <input style={styles.input} name="cardName" placeholder="Name on Card" value={payment.cardName} onChange={handlePaymentChange} />
              <input style={styles.input} name="cardNumber" placeholder="Card Number (16 digits)" value={payment.cardNumber} onChange={handlePaymentChange} />
              <div style={styles.row}>
                <input style={{ ...styles.input, flex: 1, marginRight: '10px' }} name="expiry" placeholder="MM/YY" value={payment.expiry} onChange={handlePaymentChange} />
                <input style={{ ...styles.input, flex: 1 }} name="cvv" placeholder="CVV" value={payment.cvv} onChange={handlePaymentChange} type="password" />
              </div>
              <div style={styles.row}>
                <button style={styles.backBtn} type="button" onClick={() => setStep(1)}>← Back</button>
                <button style={styles.primaryBtn} type="submit">Place Order →</button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3 - Processing */}
        {step === 3 && (
          <div style={styles.processing}>
            <div style={styles.spinner} />
            <h3 style={styles.processingText}>Processing Payment...</h3>
            <p style={styles.processingSubText}>Please don't close this page</p>
          </div>
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
  body: { padding: '30px', maxWidth: '600px', margin: '0 auto' },
  steps: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' },
  step: { fontWeight: 'bold', fontSize: '15px' },
  stepLine: { flex: 1, height: '2px', background: '#ddd', margin: '0 10px' },
  summary: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', color: '#555' },
  totalRow: { display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontSize: '18px' },
  section: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '15px' },
  sectionTitle: { margin: '0 0 15px', fontSize: '16px' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', marginBottom: '12px', fontSize: '14px' },
  row: { display: 'flex', alignItems: 'center' },
  primaryBtn: { flex: 1, padding: '12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
  backBtn: { padding: '12px 20px', background: '#999', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '15px', marginRight: '10px' },
  error: { color: 'red', marginBottom: '10px' },
  cardPreview: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '12px', padding: '20px', marginBottom: '20px', color: '#fff', minHeight: '120px' },
  cardChip: { fontSize: '20px', marginBottom: '15px', color: '#ffd700' },
  cardNumberPreview: { fontSize: '18px', letterSpacing: '3px', marginBottom: '15px', fontFamily: 'monospace' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' },
  processing: { background: '#fff', padding: '50px 20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  spinner: { width: '50px', height: '50px', border: '5px solid #f0f0f0', borderTop: '5px solid #2196F3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' },
  processingText: { fontSize: '20px', color: '#333', margin: '0 0 10px' },
  processingSubText: { color: '#999', fontSize: '14px' },
};

// Add spinner animation
const styleSheet = document.createElement('style');
styleSheet.innerText = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default Checkout;