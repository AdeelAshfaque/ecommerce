import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';
import { isAdmin } from '../../auth';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const emptyForm = {
    name: '', description: '', price: '', stock: '', category: '', image_url: ''
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/login');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products/');
      setProducts(res.data);
    } catch {
      setError('Failed to load products');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editingId) {
        await API.put(`/products/${editingId}`, data);
        setSuccess('Product updated successfully!');
      } else {
        await API.post('/products/', data);
        setSuccess('Product added successfully!');
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category || '',
      image_url: product.image_url || ''
    });
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      setSuccess('Product deleted!');
      fetchProducts();
    } catch {
      setError('Failed to delete product');
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
          <Link to="/admin/orders" style={styles.navLink}>Orders</Link>
          <Link to="/products" style={styles.navLink}>View Store</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.pageHeader}>
          <h3 style={styles.heading}>Products Management</h3>
          <button
            style={styles.addBtn}
            onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditingId(null); }}
          >
            {showForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        {/* Add/Edit Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h4 style={styles.formTitle}>{editingId ? 'Edit Product' : 'Add New Product'}</h4>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <input style={styles.input} name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
                <input style={styles.input} name="category" placeholder="Category" value={form.category} onChange={handleChange} />
                <input style={styles.input} name="price" placeholder="Price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
                <input style={styles.input} name="stock" placeholder="Stock" type="number" value={form.stock} onChange={handleChange} required />
              </div>
              <textarea style={styles.textarea} name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
              <input style={styles.input} name="image_url" placeholder="Image URL (optional)" value={form.image_url} onChange={handleChange} />
              {form.image_url && (
                <img src={form.image_url} alt="preview" style={styles.imagePreview} onError={(e) => e.target.style.display = 'none'} />
              )}
              <button style={styles.submitBtn} type="submit">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={styles.tableImg} onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <div style={styles.noImg}>No Image</div>
                    )}
                  </td>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.category || '-'}</td>
                  <td style={styles.td}>${p.price}</td>
                  <td style={styles.td}>
                    <span style={{ color: p.stock <= 5 ? '#f44336' : '#4CAF50', fontWeight: 'bold' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  heading: { margin: 0, fontSize: '22px' },
  addBtn: { padding: '10px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  error: { color: 'red', marginBottom: '10px' },
  success: { color: 'green', marginBottom: '10px' },
  formCard: { background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' },
  formTitle: { margin: '0 0 20px', fontSize: '18px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px', minHeight: '80px', marginBottom: '15px' },
  imagePreview: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', marginBottom: '15px' },
  submitBtn: { padding: '12px 30px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },
  tableCard: { background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8f9fa' },
  th: { padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', color: '#555', borderBottom: '2px solid #eee' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 15px', verticalAlign: 'middle' },
  tableImg: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' },
  noImg: { width: '50px', height: '50px', background: '#f0f0f0', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' },
  editBtn: { padding: '6px 12px', background: '#FF9800', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' },
  deleteBtn: { padding: '6px 12px', background: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default AdminProducts;