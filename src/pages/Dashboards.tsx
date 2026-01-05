import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Shared';
import { ApiService as MockService } from '../services/api';
import { Users, HardDrive, Activity } from 'lucide-react';
import { DashboardCharts } from './tenant/components/DashboardCharts';

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ total: 0, active: 0 });

    useEffect(() => {
        MockService.getTenants().then(tenants => {
            setStats({
                total: tenants.length,
                active: tenants.filter(t => t.status === 'active').length
            });
        });
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg text-brand bg-brand-light">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg text-green-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Tenants</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                            <HardDrive size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">System Status</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Healthy</h3>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};



export const TenantDashboard: React.FC = () => {

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Dashboard</h1>
                    <p className="text-gray-500">Overview of your team's activity and storage usage.</p>
                </div>
            </div>

            <DashboardCharts />
        </div>
    );
};
