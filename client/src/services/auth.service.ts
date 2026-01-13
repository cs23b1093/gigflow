import api from './api';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'client' | 'freelancer';
}

export const authService = {
    async register(userData: { name: string; email: string; password: string; role: 'client' | 'freelancer' }) {
        const response = await api.post('/auth/register', userData);
        const token = response.data.data?.token;
        if (token) {
            localStorage.setItem('token', token);
        }
        return response.data;
    },

    async login(credentials: { email: string; password: string }) {
        console.log('Attempting login with:', credentials.email);
        const response = await api.post('/auth/login', credentials);
        console.log('Login response:', response.data);

        // Check nested data structure: response.data (axios) -> data (api) -> token
        const token = response.data.data?.token;

        if (token) {
            localStorage.setItem('token', token);
            console.log('Token saved to localStorage');
        } else {
            console.error('No token received in login response');
        }
        return response.data;
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout failed on server, cleaning up local state anyway", error);
        } finally {
            localStorage.removeItem('token');
        }
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data.data; // response.data (axios) -> data (api) -> { user: ... }
    }
};
