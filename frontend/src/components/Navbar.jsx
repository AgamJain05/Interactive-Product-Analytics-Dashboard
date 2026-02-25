import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Don't show navbar on auth pages
    if (['/login', '/register'].includes(location.pathname)) return null;
    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
                    <span className="navbar-icon">📊</span>
                    <span className="navbar-title">Analytics</span>
                </div>

                <button
                    className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>

                <div className={`navbar-actions ${menuOpen ? 'show' : ''}`}>
                    <span className="navbar-user">
                        <span className="navbar-avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                        {user?.username}
                    </span>
                    <button className="btn-nav-logout" onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
