import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    // We might need a better way to get user info if not stored in localStorage,
    // but for now, token check is enough for "isLoggedIn"
    // For role-based links, we might need a context or query user data.
    // Assuming simple links for now or fetching user if needed.
    // For better experience, a UserContext is recommended, but let's stick to simple props or checking auth service if possible.
    // Actually, Dashboard had user prop. Let's make Navbar simple first.

    // To properly show links based on role, we should probably have the user state lifted.
    // But given the constraints, let's look at how pages did it.
    // Pages fetched user. 

    // Let's create a clearer Navbar that works generally.
    // Note: To get user role here without a Context, we might need to fetch it or rely on parent.
    // For now, let's assume valid token means logged in. Role-specific links might be tricky without global state.
    // let's try to get user from authService.getCurrentUser if possible, or just show general links and let page redirect if unauthorized.
    // OR we can just show "Dashboard" and the specific links are ON the dashboard.
    // But user asked for "browse gigs, my bids all pages".

    // Let's layout standard links.

    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        if (token) {
            authService.getCurrentUser().then(res => setUser(res.user)).catch(() => setUser(null));
        }
    }, [token]);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            GigFlow
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link to="/gigs" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Browse Gigs
                        </Link>
                        {user && (
                            <>
                                {user.role === 'client' && (
                                    <>
                                        <Link to="/my-gigs" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            My Gigs
                                        </Link>
                                        <Link to="/create-gig" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            Post Gig
                                        </Link>
                                    </>
                                )}
                                {user.role === 'freelancer' && (
                                    <Link to="/my-bids" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        My Bids
                                    </Link>
                                )}
                                <Link to="/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    Dashboard
                                </Link>
                            </>
                        )}
                    </div>
                    <div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                    {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Sign In</Link>
                                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg">Join</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
