// API Client for Umroh Management System

class ApiClient {
    constructor() {
        this.baseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:5000/api' 
            : '/api';
        this.token = localStorage.getItem('auth_token');
    }

    // Set authorization token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    // Get authorization headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Handle API response
    async handleResponse(response) {
        if (response.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = '/login.html';
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async logout() {
        await this.request('/auth/logout', { method: 'POST' });
        this.setToken(null);
    }

    async getMe() {
        return await this.request('/auth/me');
    }

    // Jamaah endpoints
    async getJamaahList(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/jamaah?${queryString}`);
    }

    async getJamaah(id) {
        return await this.request(`/jamaah/${id}`);
    }

    async createJamaah(data) {
        return await this.request('/jamaah', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateJamaah(id, data) {
        return await this.request(`/jamaah/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteJamaah(id) {
        return await this.request(`/jamaah/${id}`, {
            method: 'DELETE',
        });
    }

    async importJamaah(data) {
        return await this.request('/jamaah/import', {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
    }

    // Package endpoints
    async getPackages(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/packages?${queryString}`);
    }

    async getAvailablePackages() {
        return await this.request('/packages/available');
    }

    async getPackage(id) {
        return await this.request(`/packages/${id}`);
    }

    async createPackage(data) {
        return await this.request('/packages', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updatePackage(id, data) {
        return await this.request(`/packages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async updatePackageStatus(id, status) {
        return await this.request(`/packages/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // Payment endpoints
    async getPayments(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/payments?${queryString}`);
    }

    async getPaymentSummary(jamaahId) {
        return await this.request(`/payments/summary/${jamaahId}`);
    }

    async createPayment(data) {
        return await this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async verifyPayment(id) {
        return await this.request(`/payments/${id}/verify`, {
            method: 'PUT',
        });
    }

    async cancelPayment(id, reason) {
        return await this.request(`/payments/${id}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
    }

    async getPaymentReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/payments/report?${queryString}`);
    }

    // Document endpoints
    async getDocuments(jamaahId) {
        return await this.request(`/documents/jamaah/${jamaahId}`);
    }

    async uploadDocument(jamaahId, formData) {
        const response = await fetch(`${this.baseUrl}/documents/upload/${jamaahId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });
        
        return await this.handleResponse(response);
    }

    async downloadDocument(id) {
        window.open(`${this.baseUrl}/documents/${id}/download`, '_blank');
    }

    async deleteDocument(id) {
        return await this.request(`/documents/${id}`, {
            method: 'DELETE',
        });
    }

    // Report endpoints
    async getDashboardStats() {
        return await this.request('/reports/dashboard');
    }

    async getJamaahReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/reports/jamaah?${queryString}`);
    }

    async getFinancialSummary(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/reports/financial-summary?${queryString}`);
    }

    async getPackageOccupancy() {
        return await this.request('/reports/package-occupancy');
    }

    async getActivityLog(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/reports/activity-log?${queryString}`);
    }

    // User endpoints
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/users?${queryString}`);
    }

    async getUser(id) {
        return await this.request(`/users/${id}`);
    }

    async createUser(data) {
        return await this.request('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateUser(id, data) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async changePassword(id, currentPassword, newPassword) {
        return await this.request(`/users/${id}/password`, {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
        });
    }

    async toggleUserStatus(id) {
        return await this.request(`/users/${id}/toggle-status`, {
            method: 'PUT',
        });
    }

    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }
}

// Export for use in other files
window.ApiClient = ApiClient;