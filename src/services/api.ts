import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add a responsive interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            // Ideally redirect to login, but we'll handle that in components or AuthContext
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

// User Profile & Registration Services
export const userApi = {
    getProfile: () => api.get('/user'),
    updateProfile: (data: any) => api.put('/user', data),
    getRegistrations: () => api.get('/user/registrations'),
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/uploads', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteAccount: () => api.delete('/user'),
    registerWebinar: (webinarId: number) => api.post(`/user/registrations/${webinarId}`),
    getNotifications: () => api.get('/user/notifications'),
    markNotificationRead: (id: number) => api.put(`/user/notifications/${id}/read`),
    markAllNotificationsRead: () => api.put('/user/notifications/read-all'),
    createPaymentOrder: (webinarId: number, userId: number) => api.post('/payments/create-order', { webinarId, userId }),
    verifyPayment: (data: any) => api.post('/payments/verify', data)
};

export default api;
