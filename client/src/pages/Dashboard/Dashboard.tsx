import React, { useEffect, useState } from 'react';
import { authService, type User } from '../../services/auth.service';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                // userData is { user: { ... } }
                setUser(userData.user);
            } catch (error) {
                // If fetching user fails, maybe token is invalid
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="py-10">
            <header>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats / Overview Section */}
                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white dark:bg-neutral-900 overflow-hidden shadow rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-md bg-indigo-500 p-3">
                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Account Type
                                            </dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                                                    {user.role}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 overflow-hidden shadow rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-md bg-emerald-500 p-3">
                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Status
                                            </dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Active
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contextual Action Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden shadow rounded-2xl text-white">
                            <div className="p-5">
                                <h3 className="text-lg font-medium">Quick Action</h3>
                                <p className="mt-1 text-sm text-indigo-100">
                                    {user.role === 'client' ? 'Ready to find talent? Post a new gig now.' : 'Looking for work? Browse available gigs.'}
                                </p>
                                <div className="mt-4">
                                    {user.role === 'client' ? (
                                        <Link to="/create-gig" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
                                            Create Gig
                                        </Link>
                                    ) : (
                                        <Link to="/gigs" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
                                            Browse Gigs
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity or Content Area */}
                    <div className="mt-8">
                        <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                            {user.role === 'client' ? 'Your Recent Gigs' : 'Recommended for You'}
                        </h2>
                        <div className="bg-white dark:bg-neutral-900 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                            <p>Activity feed coming soon...</p>
                            <div className="mt-4">
                                {user.role === 'client' ? (
                                    <Link to="/my-gigs" className="text-indigo-600 hover:text-indigo-500 font-medium">View all your gigs &rarr;</Link>
                                ) : (
                                    <Link to="/gigs" className="text-indigo-600 hover:text-indigo-500 font-medium">Browse all gigs &rarr;</Link>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
