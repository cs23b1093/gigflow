import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Verify token with server or just check existence for speed (decide trade-off)
                // For better security, verify with server:
                // await authService.getCurrentUser();

                // For now, checking token presence might be enough for client-side routing
                // but let's do a quick check if possible or just rely on existence
                const token = localStorage.getItem('token');
                console.log('PrivateRoute checking token:', !!token);
                setIsAuthenticated(!!token);
            } catch (error) {
                console.error('PrivateRoute auth check error', error);
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Or a proper loading spinner
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
