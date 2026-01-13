import api from './api';

export interface Bid {
    _id: string;
    gigId: string;
    freelancerId: string;
    message: string;
    price: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export const bidsService = {
    // Freelancer
    async submitBid(bidData: { gigId: string; message: string; price: number }) {
        const response = await api.post('/bids', bidData);
        return response.data.data?.bid || response.data;
    },

    async getMyBids() {
        const response = await api.get('/bids/my-bids');
        return response.data.data?.bids || []; // response.data.data.bids (array)
    },

    // Client & Freelancer (depending on context)
    async getBidsForGig(gigId: string) {
        const response = await api.get(`/bids/${gigId}`);
        return response.data.data?.bids || [];
    },

    async getBidDetails(bidId: string) {
        const response = await api.get(`/bids/bid/${bidId}`);
        return response.data.data?.bid || response.data;
    },

    // Client
    async hireBid(bidId: string) {
        const response = await api.patch(`/bids/${bidId}/hire`);
        return response.data;
    }
};
