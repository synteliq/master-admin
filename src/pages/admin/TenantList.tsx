
import React, { useEffect, useState } from 'react';
import { Button, Input, Card, Badge, Modal } from '../../components/ui/Shared';
import { ApiService as MockService } from '../../services/api';
import { Tenant } from '../../types';
import { Plus, Search, Power } from 'lucide-react';

export const TenantList: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTenantName, setNewTenantName] = useState('');
    const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);

    const loadTenants = async () => {
        setLoading(true);
        try {
            const data = await MockService.getTenants();
            setTenants(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTenants();
    }, []);

    const handleCreate = async () => {
        if (!newTenantName.trim()) return;
        const tenant = await MockService.createTenant(newTenantName);
        setCreatedTenant(tenant);
        setNewTenantName('');
        loadTenants();
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        await MockService.updateTenantStatus(id, newStatus);
        loadTenants();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Management</h1>
                <Button onClick={() => { setCreatedTenant(null); setIsCreateModalOpen(true); }}>
                    <Plus size={16} className="mr-2" /> New Tenant
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search tenants..." className="pl-9" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3">Tenant Name</th>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Created</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">Loading tenants...</td>
                                </tr>
                            ) : tenants.map((tenant) => (
                                <tr key={tenant.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tenant.name}</td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{tenant.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(tenant.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={tenant.status === 'active' ? 'success' : 'destructive'}>
                                            {tenant.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleStatus(tenant.id, tenant.status)}
                                            className={tenant.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                        >
                                            <Power size={14} className="mr-1" />
                                            {tenant.status === 'active' ? 'Disable' : 'Enable'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Tenant">
                {!createdTenant ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Organization Name</label>
                            <Input
                                value={newTenantName}
                                onChange={(e) => setNewTenantName(e.target.value)}
                                placeholder="e.g. Acme Corp"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create Tenant</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
                            <h4 className="font-bold flex items-center gap-2">Success! Tenant Created</h4>
                            <p className="text-sm mt-1">Please save these credentials securely.</p>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Tenant ID</label>
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm select-all">
                                    {createdTenant.id}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">API Key</label>
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm select-all break-all text-red-600 dark:text-red-400">
                                    {createdTenant.apiKey}
                                </div>
                                <p className="text-xs text-red-500 mt-1">This key will not be shown again.</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setIsCreateModalOpen(false)}>Done</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
