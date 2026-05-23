import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { addToCart } from '../cart';
import { isAdmin } from '../auth';

function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [added, setAdded] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, sortBy, category, products]);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products/');
      setProducts(res.data);
      setFiltered(res.data);

      const cats = [
        ...new Set(res.data.map((p) => p.category).filter(Boolean)),
      ];

      setCategories(cats);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const applyFilters = () => {
    let result = [...products];

    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    if (search) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === 'low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFiltered(result);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    addToCart(product);

    setAdded((prev) => ({
      ...prev,
      [product.id]: true,
    }));

    setTimeout(() => {
      setAdded((prev) => ({
        ...prev,
        [product.id]: false,
      }));
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo}>Ecommerce</h2>

        <div style={styles.navLinks}>
          {isAdmin() && (
            <Link to="/admin/products" style={styles.adminLink}>
              Admin Panel
            </Link>
          )}

          <Link to="/cart" style={styles.navLink}>
            Cart
          </Link>

          {token ? (
            <>
              <Link to="/orders" style={styles.navLink}>
                My Orders
              </Link>

              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={styles.navLink}>
              Login
            </Link>
          )}
        </div>
      </div>

      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Discover Amazing Products</h1>

        <p style={styles.heroText}>
          Premium collections with modern style and comfort.
        </p>

        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.content}>
        {sidebarOpen && (
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3 style={{ margin: 0 }}>Filters</h3>
            </div>

            <div style={styles.section}>
              <p style={styles.sectionTitle}>Categories</p>

              <div
                style={{
                  ...styles.filterItem,
                  ...(category === 'all' ? styles.activeFilter : {}),
                }}
                onClick={() => setCategory('all')}
              >
                All Products
              </div>

              {categories.map((cat) => (
                <div
                  key={cat}
                  style={{
                    ...styles.filterItem,
                    ...(category === cat ? styles.activeFilter : {}),
                  }}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <p style={styles.sectionTitle}>Sort By</p>

              <div
                style={{
                  ...styles.filterItem,
                  ...(sortBy === 'low' ? styles.activeFilter : {}),
                }}
                onClick={() => setSortBy('low')}
              >
                Price: Low to High
              </div>

              <div
                style={{
                  ...styles.filterItem,
                  ...(sortBy === 'high' ? styles.activeFilter : {}),
                }}
                onClick={() => setSortBy('high')}
              >
                Price: High to Low
              </div>

              <div
                style={{
                  ...styles.filterItem,
                  ...(sortBy === 'name' ? styles.activeFilter : {}),
                }}
                onClick={() => setSortBy('name')}
              >
                Name A-Z
              </div>
            </div>

            <button
              style={styles.resetBtn}
              onClick={() => {
                setSearch('');
                setCategory('all');
                setSortBy('default');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        <div style={styles.main}>
          <div style={styles.topBar}>
            <button
              style={styles.toggleBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
            </button>

            <p style={styles.results}>
              {filtered.length} product
              {filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          {filtered.length === 0 && !error && (
            <div style={styles.empty}>
              <h2>No products found</h2>

              <button
                style={styles.resetBtn}
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                  setSortBy('default');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

          <div style={styles.grid}>
            {filtered.map((p) => (
              <div
                key={p.id}
                style={styles.card}
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <div style={styles.imageWrapper}>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={styles.productImg}
                    />
                  ) : (
                    <div style={styles.noImg}>No Image</div>
                  )}

                  {p.category && (
                    <span style={styles.categoryBadge}>
                      {p.category}
                    </span>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.productName}>{p.name}</h3>

                  <p style={styles.desc}>{p.description}</p>

                  <div style={styles.cardFooter}>
                    <div>
                      <p style={styles.price}>${p.price}</p>

                      {p.stock > 0 ? (
                        <span style={styles.stock}>
                          {p.stock} in stock
                        </span>
                      ) : (
                        <span style={styles.outStock}>
                          Out of stock
                        </span>
                      )}
                    </div>

                    <button
                      style={{
                        ...styles.cartBtn,
                        background:
                          p.stock === 0
                            ? '#cbd5e1'
                            : added[p.id]
                            ? '#10b981'
                            : '#2563eb',
                      }}
                      disabled={p.stock === 0}
                      onClick={(e) => handleAddToCart(e, p)}
                    >
                      {p.stock === 0
                        ? 'Unavailable'
                        : added[p.id]
                        ? 'Added'
                        : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: 'Arial',
  },

  navbar: {
    background: '#0f172a',
    padding: '18px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  logo: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
  },

  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },

  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
  },

  adminLink: {
    color: '#facc15',
    textDecoration: 'none',
    fontWeight: 'bold',
  },

  logoutBtn: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '10px',
    background: '#ef4444',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  hero: {
    padding: '70px 20px',
    textAlign: 'center',
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    color: '#fff',
  },

  heroTitle: {
    margin: 0,
    fontSize: '46px',
    fontWeight: 'bold',
  },

  heroText: {
    marginTop: '12px',
    fontSize: '17px',
    opacity: 0.9,
  },

  searchBox: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'center',
  },

  searchInput: {
    width: '100%',
    maxWidth: '550px',
    padding: '16px 22px',
    borderRadius: '50px',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },

  content: {
    display: 'flex',
    padding: '30px',
    gap: '25px',
  },

  sidebar: {
    width: '240px',
    background: '#fff',
    borderRadius: '20px',
    padding: '25px',
    height: 'fit-content',
    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
  },

  sidebarHeader: {
    marginBottom: '25px',
  },

  section: {
    marginBottom: '30px',
  },

  sectionTitle: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },

  filterItem: {
    padding: '12px 15px',
    borderRadius: '12px',
    marginBottom: '10px',
    background: '#f8fafc',
    cursor: 'pointer',
    transition: '0.2s',
    fontWeight: '500',
  },

  activeFilter: {
    background: '#2563eb',
    color: '#fff',
  },

  resetBtn: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '12px',
    background: '#0f172a',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  main: {
    flex: 1,
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
  },

  toggleBtn: {
    padding: '11px 18px',
    borderRadius: '12px',
    border: 'none',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },

  results: {
    color: '#475569',
    fontWeight: '500',
  },

  error: {
    color: 'red',
  },

  empty: {
    textAlign: 'center',
    padding: '80px 20px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '25px',
  },

  card: {
    background: '#fff',
    borderRadius: '22px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: '0.3s',
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
  },

  imageWrapper: {
    position: 'relative',
  },

  productImg: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
  },

  noImg: {
    width: '100%',
    height: '240px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#e2e8f0',
    color: '#64748b',
  },

  categoryBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    background: '#fff',
    padding: '6px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
  },

  cardBody: {
    padding: '20px',
  },

  productName: {
    margin: '0 0 10px',
    fontSize: '20px',
  },

  desc: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.6',
    minHeight: '45px',
  },

  cardFooter: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2563eb',
  },

  stock: {
    color: '#16a34a',
    fontSize: '13px',
  },

  outStock: {
    color: '#dc2626',
    fontSize: '13px',
  },

  cartBtn: {
    padding: '12px 18px',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Products;