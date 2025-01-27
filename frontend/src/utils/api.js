import axios from 'axios';

// API temel URL'i
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ayxanmammadov.pythonanywhere.com';

// API endpoint'leri
export const ENDPOINTS = {
    LOGIN: '/api/admin/login',
    LOGOUT: '/api/admin/logout',
    CHECK_AUTH: '/api/admin/check-auth',
    COURSES: '/api/courses',
    CATEGORIES: '/api/categories',
    TAGS: '/api/tags',
    ADMIN_COURSES: '/api/admin/courses',
    REMOVE_DISCOUNTS: '/api/admin/remove-discounts',
    DOWNLOAD: '/api/download'
};

// API çağrıları için yardımcı fonksiyonlar
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Login isteği için
export const loginAdmin = async (credentials) => {
    try {
        const response = await api.post('/api/admin/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // Token'ı default headers'a ekle
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Diğer API istekleri için token kontrolü
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// GET isteği
export const get = async (endpoint, params = {}) => {
    const url = new URL(API_BASE_URL + endpoint);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        credentials: 'include',
        headers
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// POST isteği
export const post = async (endpoint, data = {}) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(API_BASE_URL + endpoint, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// PUT isteği
export const put = async (endpoint, data = {}) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(API_BASE_URL + endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// DELETE isteği
export const deleteRequest = async (endpoint) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(API_BASE_URL + endpoint, {
        method: 'DELETE',
        credentials: 'include',
        headers
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// Form data ile POST isteği (dosya yükleme için)
export const postFormData = async (endpoint, formData) => {
    const headers = {};
    
    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(API_BASE_URL + endpoint, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// Form data ile PUT isteği (dosya güncelleme için)
export const putFormData = async (endpoint, formData) => {
    const headers = {};
    
    const token = localStorage.getItem('token');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(API_BASE_URL + endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
}; 
