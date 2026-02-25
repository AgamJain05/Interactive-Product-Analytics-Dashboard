import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', password: '', age: '', gender: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                username: form.username,
                password: form.password,
                age: form.age ? Number(form.age) : undefined,
                gender: form.gender || undefined,
            });
            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join the analytics dashboard</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="reg-username">Username</label>
                        <input
                            id="reg-username"
                            className="form-input"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input
                            id="reg-password"
                            className="form-input"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="reg-age">Age <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                            <input
                                id="reg-age"
                                className="form-input"
                                name="age"
                                type="number"
                                min="1"
                                max="120"
                                value={form.age}
                                onChange={handleChange}
                                placeholder="Your age"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-gender">Gender <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                            <select
                                id="reg-gender"
                                className="form-input"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                            >
                                <option value="">Prefer not to say</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? (
                            <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</>
                        ) : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
