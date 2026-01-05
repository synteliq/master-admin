import { Tenant, TenantFile } from '../types';

// Initial Mock Data
const INITIAL_TENANTS: Tenant[] = [
    {
        id: 'tnt_001',
        name: 'Acme Corp',
        status: 'active',
        createdAt: new Date('2024-01-15').toISOString(),
        apiKey: 'ak_test_12345',
    },
    {
        id: 'tnt_002',
        name: 'Globex Inc',
        status: 'disabled',
        createdAt: new Date('2024-02-20').toISOString(),
        apiKey: 'ak_test_67890',
    },
];

const INITIAL_FILES: Record<string, TenantFile[]> = {
    'tnt_001': [
        { id: 'file_1', name: 'process_docs.pdf', size: 1024000, uploadedAt: new Date().toISOString(), url: '#' },
        { id: 'file_2', name: 'logo.png', size: 50000, uploadedAt: new Date().toISOString(), url: '#' },
    ],
    'tnt_002': [],
};

// LocalStorage Helper
const getStorage = <T>(key: string, initial: T): T => {
    const stored = localStorage.getItem(key);
    if (!stored) return initial;
    try {
        return JSON.parse(stored);
    } catch {
        return initial;
    }
};

const setStorage = <T>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Delay Simulator
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Service Methods
export const MockService = {
    // Admin: Get All Tenants
    getTenants: async (): Promise<Tenant[]> => {
        await delay(500);
        return getStorage('tenants', INITIAL_TENANTS);
    },

    // Admin: Create Tenant
    createTenant: async (name: string): Promise<Tenant> => {
        await delay(800);
        const tenants = getStorage('tenants', INITIAL_TENANTS);
        const newTenant: Tenant = {
            id: `tnt_${Math.random().toString(36).substr(2, 6)}`,
            name,
            status: 'active',
            createdAt: new Date().toISOString(),
            apiKey: `ak_${Math.random().toString(36).substr(2, 12)}`,
        };
        tenants.push(newTenant);
        setStorage('tenants', tenants);
        // Initialize empty files for new tenant
        const files = getStorage('files', INITIAL_FILES);
        files[newTenant.id] = [];
        setStorage('files', files);
        return newTenant;
    },

    // Admin: Update Tenant Status
    updateTenantStatus: async (id: string, status: 'active' | 'disabled'): Promise<Tenant> => {
        await delay(400);
        const tenants = getStorage('tenants', INITIAL_TENANTS);
        const idx = tenants.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Tenant not found');
        tenants[idx].status = status;
        setStorage('tenants', tenants);
        return tenants[idx];
    },

    // Admin/Tenant: Regenerate API Key
    regenerateApiKey: async (id: string): Promise<string> => {
        await delay(600);
        const tenants = getStorage('tenants', INITIAL_TENANTS);
        const idx = tenants.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Tenant not found');
        const newKey = `ak_${Math.random().toString(36).substr(2, 12)}`;
        tenants[idx].apiKey = newKey;
        setStorage('tenants', tenants);
        return newKey;
    },

    // Tenant: Login Verify
    verifyTenant: async (id: string, apiKey: string): Promise<Tenant> => {
        await delay(600);
        const tenants = getStorage('tenants', INITIAL_TENANTS);
        const tenant = tenants.find((t) => t.id === id && t.apiKey === apiKey);
        if (!tenant) throw new Error('Invalid Credentials');
        if (tenant.status === 'disabled') throw new Error('Account Disabled');
        return tenant;
    },

    // Tenant: Get Files
    getFiles: async (tenantId: string): Promise<TenantFile[]> => {
        await delay(500);
        const files = getStorage('files', INITIAL_FILES);
        return files[tenantId] || [];
    },

    // Tenant: Upload File (Mock)
    uploadFile: async (tenantId: string, file: File): Promise<TenantFile> => {
        await delay(1500);
        const files = getStorage('files', INITIAL_FILES);
        const newFile: TenantFile = {
            id: `file_${Math.random().toString(36).substr(2, 6)}`,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            url: '#', // Mock URL
        };
        const tenantFiles = files[tenantId] || [];
        tenantFiles.unshift(newFile);
        files[tenantId] = tenantFiles;
        setStorage('files', files);
        return newFile;
    },

    // Tenant: Delete File
    deleteFile: async (tenantId: string, fileId: string): Promise<void> => {
        await delay(400);
        const files = getStorage('files', INITIAL_FILES);
        const tenantFiles = files[tenantId] || [];
        files[tenantId] = tenantFiles.filter((f) => f.id !== fileId);
        setStorage('files', files);
    },
};
