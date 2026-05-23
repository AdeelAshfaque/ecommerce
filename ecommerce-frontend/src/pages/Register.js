import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/users/register', { name, email, password });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <form onSubmit={handleRegister}>
          <input
            style={styles.input}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit">Register</button>
        </form>
        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' },
  card: { background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '350px' },
  title: { textAlign: 'center', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
  error: { color: 'red', marginBottom: '10px', textAlign: 'center' },
  success: { color: 'green', marginBottom: '10px', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: '15px' }
};

export default Register;