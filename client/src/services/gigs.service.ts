import api from './api';

export interface Gig {
    _id: string;
    title: string;
    description: string;
    budget: number;
    deadline: string;
    clientId: string;
    ownerId?: { name: string; email: string };
    status: 'open' | 'in-progress' | 'completed';
    createdAt: string;
}

export const gigsService = {
    async getGigs(searchParams?: any) {
        const response = await api.get('/gigs', { params: searchParams });
        return response.data.data.gigs; // response.data (axios) -> data (api) -> gigs (array)
    },

    async getGig(id: string) {
        const response = await api.get(`/gigs/${id}`);
        return response.data.data.gig; // response.data (axios) -> data (api) -> gig (object)
    },

    // Client Only
    async createGig(gigData: Partial<Gig>) {
        const response = await api.post('/gigs', gigData);
        return response.data.data.gig;
    },

    async updateGig(id: string, gigData: Partial<Gig>) {
        const response = await api.put(`/gigs/${id}`, gigData);
        return response.data.data.gig;
    },

    async deleteGig(id: string) {
        const response = await api.delete(`/gigs/${id}`);
        return response.data;
    },

    async getMyGigs() {
        const response = await api.get('/gigs/user/my-gigs');
        return response.data.data.gigs;
    }
};
