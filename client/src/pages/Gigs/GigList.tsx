import React, { useEffect, useState } from 'react';
import { gigsService, type Gig } from '../../services/gigs.service';
import { Link } from 'react-router-dom';

const GigList: React.FC = () => {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGigs = async () => {
            try {
                const data = await gigsService.getGigs();
                setGigs(data);
            } catch (error) {
                console.error("Failed to fetch gigs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGigs();
    }, []);

    if (loading) return <div>Loading gigs...</div>;


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Find Your Next <span className="text-indigo-600">Opportunity</span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                    Explore thousands of gigs and connect with clients looking for your expertise.
                </p>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {gigs.map(gig => (
                            <div key={gig._id} className="group bg-white dark:bg-neutral-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                            Gig
                                        </span>
                                        <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                                            ${gig.budget}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">
                                        {gig.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                                        {gig.description}
                                    </p>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-950/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                        Posted recently
                                    </span>
                                    <Link to={`/gigs/${gig._id}`} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline">
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    {gigs.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No gigs found at the moment.</p>
                            <p className="text-gray-400 dark:text-gray-500">Check back later or post a gig if you're a client!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default GigList;
