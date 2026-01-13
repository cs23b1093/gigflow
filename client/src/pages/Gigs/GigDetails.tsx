import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gigsService, type Gig } from '../../services/gigs.service';
import { bidsService, type Bid } from '../../services/bids.service';
import { authService, type User } from '../../services/auth.service';

const GigDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [gig, setGig] = useState<Gig | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [bidMessage, setBidMessage] = useState('');
    const [bidPrice, setBidPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current user
                try {
                    const userData = await authService.getCurrentUser();
                    setCurrentUser(userData.user);
                } catch (e) {
                    // User might not be logged in, which is fine for viewing details (maybe)
                }

                if (id) {
                    const gigData = await gigsService.getGig(id);
                    setGig(gigData);

                    // Fetch bids if client (owner) or freelancer (their own bid?)
                    // Simplified: Fetch all bids if owner
                    // Real app: Check permissions on server too
                    try {
                        const bidsData = await bidsService.getBidsForGig(id);
                        setBids(bidsData);
                    } catch (e) {
                        // Might be 403 if not owner, ignore
                    }
                }
            } catch (error) {
                console.error("Failed to load gig details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleBidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            await bidsService.submitBid({
                gigId: id,
                message: bidMessage,
                price: Number(bidPrice)
            });
            alert("Bid submitted!");
            // Refresh bids or redirect
            navigate('/dashboard'); // or reload
        } catch (error) {
            console.error("Failed to submit bid", error);
            alert("Failed to submit bid");
        }
    };

    const handleHire = async (bidId: string) => {
        try {
            await bidsService.hireBid(bidId);
            alert("Freelancer hired!");
            // Refresh
            if (id) {
                const gigData = await gigsService.getGig(id);
                setGig(gigData);
            }
        } catch (error) {
            console.error("Failed to hire", error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!gig) return <div>Gig not found</div>;

    const isOwner = currentUser && gig.clientId === currentUser._id;
    const isFreelancer = currentUser && currentUser.role === 'freelancer';

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Card */}
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-8 relative">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-24"></div>
                <div className="px-8 pb-8">
                    <div className="relative -top-10 mb-4 flex justify-between items-end">
                        <div className="bg-white dark:bg-black p-2 rounded-2xl shadow-lg inline-block">
                            <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm border ${gig.status === 'open' ? 'bg-green-100 text-green-800 border-green-200' :
                            gig.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                            {gig.status.toUpperCase()}
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{gig.title}</h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Budget</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">${gig.budget}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Deadline</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{new Date(gig.deadline).toLocaleDateString()}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Client</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white truncate">{(gig.ownerId as any)?.name || 'Unknown'}</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About this Gig</h3>
                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            <p className="whitespace-pre-wrap leading-relaxed">{gig.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Freelancer Bid Form */}
            {isFreelancer && gig.status === 'open' && (
                <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Submit a Proposal</h3>
                    <form onSubmit={handleBidSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Why are you a good fit?</label>
                            <textarea
                                value={bidMessage}
                                onChange={e => setBidMessage(e.target.value)}
                                required
                                placeholder="Describe your approach and relevant experience..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                rows={5}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Bid Price ($)</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    value={bidPrice}
                                    onChange={e => setBidPrice(e.target.value)}
                                    required
                                    className="w-full pl-7 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-lg transition-all transform hover:-translate-y-1">
                            Submit Proposal
                        </button>
                    </form>
                </div>
            )}

            {/* Client Bids View */}
            {isOwner && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Received Proposals ({bids.length})</h3>
                    {bids.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No proposals received yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {bids.map(bid => (
                                <div key={bid._id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all">
                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">${bid.price}</span>
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>{bid.status}</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{bid.message}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-600">Submitted on {new Date(bid.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        {bid.status === 'pending' && gig.status === 'open' && (
                                            <button
                                                onClick={() => handleHire(bid._id)}
                                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors whitespace-nowrap"
                                            >
                                                Accept & Hire
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GigDetails;
