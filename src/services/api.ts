import { Tenant, TenantFile, Team } from '../types';

const API_URL = 'http://127.0.0.1:5001';

const getAuthHeaders = () => {
    const storedAuth = localStorage.getItem('auth_session');
    if (!storedAuth) return {};
    const { token, user } = JSON.parse(storedAuth);
    // Basic security for this simple demo
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const ApiService = {
    // --- Admin ---
    getTenants: async (): Promise<Tenant[]> => {
        const res = await fetch(`${API_URL}/tenants`);
        if (!res.ok) throw new Error('Failed to fetch tenants');
        return res.json();
    },

    createTenant: async (name: string): Promise<Tenant> => {
        const res = await fetch(`${API_URL}/tenants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to create tenant');
        return res.json();
    },

    updateTenantStatus: async (id: string, status: 'active' | 'disabled'): Promise<Tenant> => {
        const res = await fetch(`${API_URL}/tenants/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update status');
        if (!res.ok) throw new Error('Failed to update status');
        return res.json();
    },

    getTenant: async (id: string): Promise<Tenant> => {
        const res = await fetch(`${API_URL}/tenants/${id}`);
        if (!res.ok) throw new Error('Failed to fetch tenant');
        return res.json();
    },

    regenerateApiKey: async (id: string): Promise<string> => {
        throw new Error("Not implemented in basic backend");
    },

    // --- Login ---
    loginAdmin: async (username: string, password: string) => {
        const res = await fetch(`${API_URL}/login/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    verifyTenant: async (tenantId: string, apiKey: string): Promise<Tenant> => {
        const res = await fetch(`${API_URL}/login/tenant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId, apiKey }), // API Key still sent but ignored by updated backend
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Invalid credentials');
        }
        return res.json();
    },

    // --- Tenant Files ---
    getFiles: async (tenantId: string): Promise<TenantFile[]> => {
        const res = await fetch(`${API_URL}/tenants/${tenantId}/files`);
        if (!res.ok) throw new Error('Failed to fetch files');
        return res.json();
    },

    uploadFile: async (tenantId: string, file: File): Promise<TenantFile> => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/tenants/${tenantId}/files`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    },

    deleteFile: async (tenantId: string, fileId: string): Promise<void> => {
        // Backend delete not implemented in minimal version, but UI expects it
        console.warn("Delete not implemented in reference backend");
    },

    // --- Tenant Branding & Customers ---
    updateBranding: async (tenantId: string, brandColor: string, font: string): Promise<Tenant> => {
        const res = await fetch(`${API_URL}/tenants/${tenantId}/branding`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brandColor, font }),
        });
        if (!res.ok) throw new Error('Failed to update branding');
        return res.json();
    },

    getTeams: async (tenantId: string): Promise<Team[]> => {
        const res = await fetch(`${API_URL}/tenants/${tenantId}/teams`);
        if (!res.ok) throw new Error('Failed to fetch teams');
        return res.json();
    },

    createTeam: async (tenantId: string, data: Omit<Team, 'id' | 'createdAt'>): Promise<Team> => {
        const res = await fetch(`${API_URL}/tenants/${tenantId}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create team');
        return res.json();
    },

    updateTeam: async (tenantId: string, teamId: string, data: Partial<Team>): Promise<Team> => {
        const res = await fetch(`${API_URL}/tenants/${tenantId}/teams/${teamId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update team');
        return res.json();
    }
};
