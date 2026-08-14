import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';

/**
 * Base Axios instance — no auth headers attached here.
 * Use the `useApi()` hook in components for authenticated requests.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL,
});

export default api;

/**
 * useApi — Returns a pre-configured Axios instance that automatically
 * attaches the Clerk Bearer token on every request.
 *
 * Usage (inside a React component):
 *   const api = useApi();
 *   const { data } = await api.get('/api/workspaces');
 *
 * This eliminates the repetitive getToken() + Authorization header boilerplate
 * that was previously duplicated across 10+ components.
 */
export const useApi = () => {
    const { getToken } = useAuth();

    const authApi = useMemo(() => {
        const instance = axios.create({
            baseURL: import.meta.env.VITE_BASEURL,
        });

        instance.interceptors.request.use(async (config) => {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return instance;
    }, [getToken]);

    return authApi;
};