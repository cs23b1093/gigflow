import React, { useEffect, useState } from 'react';
import { bidsService, type Bid } from '../../services/bids.service';
import { Link } from 'react-router-dom';

const MyBids: React.FC = () => {
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyBids = async () => {
            try {
                const data = await bidsService.getMyBids();
                setBids(data);
            } catch (error) {
                console.error("Failed to fetch my bids", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyBids();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-12">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Bids</h1>
                <p className="text-gray-500 dark:text-gray-400">Track the status of your proposals.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {bids.map(bid => (
                    <div key={bid._id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">Gig ID: {bid.gigId}</span>
                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${bid.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                    bid.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    }`}>
                                    {bid.status}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">${bid.price}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">bid amount</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Link to={`/gigs/${bid.gigId}`} className="w-full md:w-auto text-center px-6 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors border border-gray-200 dark:border-gray-700">
                                View Gig
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {bids.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">You haven't placed any bids yet.</p>
                    <Link to="/gigs" className="text-indigo-600 hover:text-indigo-500 font-semibold">Start browsing gigs &rarr;</Link>
                </div>
            )}
        </div>
    );
};

export default MyBids;
