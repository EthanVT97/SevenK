import { LoginCredentials, RegisterCredentials, User } from '../types/auth';

const API_URL = 'your-api-endpoint'; // Replace with your actual API endpoint

export const authService = {
    async login(credentials: LoginCredentials): Promise<User> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.user;
    },

    async register(credentials: RegisterCredentials): Promise<User> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.user;
    },

    logout() {
        localStorage.removeItem('token');
    },
}; 