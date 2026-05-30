import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { addToCart } from '../cart';
import { isAdmin } from '../auth';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      fetchRelated(res.data.category, res.data.id);
    } catch {
      setError('Product not found');
    }
  };

  const fetchRelated = async (category, currentId) => {
    try {
      const res = await API.get('/products/');
      const rel = res.data.filter(p => p.category === category && p.id !== currentId).slice(0, 4);
      setRelated(rel);
    } catch {}
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) return (
    <div style={styles.container}>
      <div style={styles.center}>
        <p style={{ fontSize: '20px' }}>😕 {error}</p>
        <Link to="/products" style={styles.backLink}>← Back to Products</Link>
      </div>
    </div>
  );

  if (!product) return (
    <div style={styles.container}>
      <div style={styles.center}><p>Loading...</p></div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🛒 Ecommerce</h2>
        <div style={styles.navLinks}>
          {isAdmin() && <Link to="/admin/products" style={styles.adminLink}>⚙️ Admin Panel</Link>}
          <Link to="/cart" style={styles.navLink}>🛒 Cart</Link>
          {token ? (
            <>
              <Link to="/orders" style={styles.navLink}>My Orders</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <Link to="/login" style={styles.navLink}>Login</Link>
          )}
        </div>
      </div>

      <div style={styles.body}>
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link to="/products" style={styles.breadLink}>Products</Link>
          <span style={styles.breadSep}> / </span>
          {product.category && (
            <>
              <span style={styles.breadText}>{product.category}</span>
              <span style={styles.breadSep}> / </span>
            </>
          )}
          <span style={styles.breadCurrent}>{product.name}</span>
        </div>

        {/* Product Detail */}
        <div style={styles.productSection}>
          {/* Image */}
          <div style={styles.imageBox}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={styles.productImg} onError={(e) => e.target.style.display = 'none'} />
            ) : (
              <div style={styles.noImg}>No Image</div>
            )}
          </div>

          {/* Info */}
          <div style={styles.infoBox}>
            {product.category && <span style={styles.categoryBadge}>{product.category}</span>}
            <h1 style={styles.productName}>{product.name}</h1>
            <p style={styles.price}>${product.price}</p>
            <p style={styles.desc}>{product.description}</p>

            <div style={styles.stockInfo}>
              {product.stock === 0 ? (
                <span style={styles.outOfStock}>❌ Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span style={styles.lowStock}>⚠️ Only {product.stock} left!</span>
              ) : (
                <span style={styles.inStock}>✅ In Stock ({product.stock} available)</span>
              )}
            </div>

            {product.stock > 0 && (
              <>
                <div style={styles.quantityRow}>
                  <span style={styles.qtyLabel}>Quantity:</span>
                  <div style={styles.qtyControl}>
                    <button style={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span style={styles.qtyValue}>{quantity}</span>
                    <button style={styles.qtyBtn} onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                  </div>
                </div>

                <div style={styles.actionRow}>
                  <button
                    style={{ ...styles.addToCartBtn, background: added ? '#4CAF50' : '#2196F3' }}
                    onClick={handleAddToCart}
                  >
                    {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                  </button>
                  <button
                    style={styles.buyNowBtn}
                    onClick={() => { handleAddToCart(); navigate('/cart'); }}
                  >
                    Buy Now →
                  </button>
                </div>
              </>
            )}

            <div style={styles.metaInfo}>
              <div style={styles.metaItem}><span style={styles.metaIcon}>🚚</span> Free delivery on orders over $100</div>
              <div style={styles.metaItem}><span style={styles.metaIcon}>↩️</span> 30-day return policy</div>
              <div style={styles.metaItem}><span style={styles.metaIcon}>🔒</span> Secure checkout</div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={styles.relatedSection}>
            <h3 style={styles.relatedTitle}>Related Products</h3>
            <div style={styles.relatedGrid}>
              {related.map(p => (
                <div key={p.id} style={styles.relatedCard} onClick={() => navigate(`/products/${p.id}`)}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={styles.relatedImg} onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div style={{ ...styles.noImg, height: '140px' }}>No Image</div>
                  )}
                  <div style={styles.relatedBody}>
                    <p style={styles.relatedName}>{p.name}</p>
                    <p style={styles.relatedPrice}>${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f6fa' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.08)' },
  logo: { margin: 0 },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  navLink: { color: '#2196F3', textDecoration: 'none', fontWeight: 'bold' },
  adminLink: { color: '#FF9800', textDecoration: 'none', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  body: { padding: '20px 30px', maxWidth: '1100px', margin: '0 auto' },
  breadcrumb: { marginBottom: '20px', fontSize: '14px' },
  breadLink: { color: '#2196F3', textDecoration: 'none' },
  breadSep: { color: '#999', margin: '0 5px' },
  breadText: { color: '#666' },
  breadCurrent: { color: '#333', fontWeight: 'bold' },
  productSection: { display: 'flex', gap: '40px', background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 2px 15px rgba(0,0,0,0.08)', marginBottom: '30px', flexWrap: 'wrap' },
  imageBox: { flex: '1', minWidth: '280px', maxWidth: '450px' },
  productImg: { width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '450px' },
  noImg: { width: '100%', height: '300px', background: '#f5f6fa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' },
  infoBox: { flex: '1', minWidth: '280px' },
  categoryBadge: { background: '#e3f2fd', color: '#2196F3', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  productName: { fontSize: '28px', margin: '12px 0', color: '#1a1a2e' },
  price: { fontSize: '32px', color: '#2196F3', fontWeight: 'bold', margin: '0 0 15px' },
  desc: { color: '#666', fontSize: '15px', lineHeight: '1.7', margin: '0 0 20px' },
  stockInfo: { marginBottom: '20px', fontSize: '14px' },
  inStock: { color: '#4CAF50', fontWeight: 'bold' },
  lowStock: { color: '#FF9800', fontWeight: 'bold' },
  outOfStock: { color: '#f44336', fontWeight: 'bold' },
  quantityRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  qtyLabel: { fontWeight: 'bold', color: '#555' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '0', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' },
  qtyBtn: { width: '36px', height: '36px', background: '#f5f6fa', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#2196F3' },
  qtyValue: { width: '40px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' },
  actionRow: { display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' },
  addToCartBtn: { flex: 1, padding: '14px', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  buyNowBtn: { flex: 1, padding: '14px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  metaInfo: { borderTop: '1px solid #f0f0f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  metaItem: { color: '#666', fontSize: '14px' },
  metaIcon: { marginRight: '8px' },
  relatedSection: { marginTop: '10px' },
  relatedTitle: { fontSize: '20px', marginBottom: '15px' },
  relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' },
  relatedCard: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' },
  relatedImg: { width: '100%', height: '140px', objectFit: 'cover' },
  relatedBody: { padding: '12px' },
  relatedName: { margin: '0 0 5px', fontWeight: 'bold', fontSize: '14px' },
  relatedPrice: { margin: 0, color: '#2196F3', fontWeight: 'bold' },
  backLink: { color: '#2196F3', textDecoration: 'none', fontWeight: 'bold' },
};

export default ProductDetail;