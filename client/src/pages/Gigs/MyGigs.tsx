import React, { useEffect, useState } from 'react';
import { gigsService, type Gig } from '../../services/gigs.service';
import { Link } from 'react-router-dom';

const MyGigs: React.FC = () => {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyGigs = async () => {
            try {
                const data = await gigsService.getMyGigs();
                setGigs(data);
            } catch (error) {
                console.error("Failed to fetch my gigs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyGigs();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-12 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Gigs</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage the gigs you've posted.</p>
                </div>
                <Link to="/create-gig" className="md:hidden inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Post New Gig
                </Link>
            </header>

            <div className="grid gap-6">
                {gigs.map(gig => (
                    <div key={gig._id} className="bg-white dark:bg-neutral-900 shadow-md rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${gig.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                    gig.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {gig.status}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500 text-sm">{new Date(gig.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{gig.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">{gig.description}</p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Link to={`/gigs/${gig._id}`} className="w-full md:w-auto text-center px-6 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                                Manage Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            {gigs.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven't posted any gigs yet.</p>
                    <Link to="/create-gig" className="text-indigo-600 hover:text-indigo-500 font-semibold">Post your first gig &rarr;</Link>
                </div>
            )}
        </div>
    );
};

export default MyGigs;
