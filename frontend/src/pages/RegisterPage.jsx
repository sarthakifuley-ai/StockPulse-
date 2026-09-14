import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-card" style={{ width: '400px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', marginBottom: '12px'
          }}>
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>Create New Account</h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Start tracking stock predictions & portfolio valuation</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '4px' }}>FULL NAME</label>
            <input
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '4px' }}>EMAIL ADDRESS</label>
            <input
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '4px' }}>PASSWORD</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: '10px' }}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#9ca3af' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
