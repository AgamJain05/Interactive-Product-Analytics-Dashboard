import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrap any route element with this to require authentication.
 * Unauthenticated users are redirected to /login.
 * The `replace` prop prevents the login page from being pushed onto history.
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
