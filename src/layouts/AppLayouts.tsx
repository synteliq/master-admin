import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Shared';
import { LayoutDashboard, Users, Settings, LogOut, FileText, UploadCloud, BarChart, Palette } from 'lucide-react';
import { cn } from '../utils/cn';
import { ApiService } from '../services/api';

interface SidebarItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800',
                isActive ? 'shadow-md' : 'text-gray-500 dark:text-gray-400'
            )
        }
        style={({ isActive }) => isActive ? { backgroundColor: 'var(--brand-primary)', color: 'white' } : {}}
    >
        {icon}
        {label}
    </NavLink>
);

export const AdminLayout: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hidden md:flex flex-col">
                <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Tenant Master</span>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-4">
                    <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                    <SidebarItem to="/admin/tenants" icon={<Users size={18} />} label="Tenants" />
                    <SidebarItem to="/admin/analytics" icon={<BarChart size={18} />} label="Analytics" />
                </nav>
                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                            A
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">Admin</p>
                            <p className="text-xs text-gray-500">Master Access</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900 md:hidden">
                    <span className="font-bold">Tenant Master</span>
                    <Button size="sm" variant="ghost" onClick={handleLogout}><LogOut size={16} /></Button>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export const TenantLayout: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();



    React.useEffect(() => {
        const applyBranding = async () => {
            if (!user?.id) return;
            try {
                console.log('Fetching tenant settings for:', user.id);
                const tenant = await ApiService.getTenant(user.id);
                console.log('Tenant data received:', tenant);

                if (tenant.settings) {
                    if (tenant.settings.brandColor) {
                        console.log('Applying brand color:', tenant.settings.brandColor);
                        document.documentElement.style.setProperty('--brand-primary', tenant.settings.brandColor);
                    }
                    if (tenant.settings.font) {
                        document.documentElement.style.fontFamily =
                            tenant.settings.font === 'Inter' ? '"Inter", sans-serif' :
                                tenant.settings.font === 'Serif' ? 'Georgia, serif' :
                                    tenant.settings.font === 'Mono' ? 'monospace' : 'system-ui';
                    }
                }
            } catch (err) {
                console.error("Failed to apply branding", err);
            }
        };
        applyBranding();
    }, [user?.id]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 hidden md:flex flex-col">
                <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Tenant Portal</span>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-4">
                    <SidebarItem to="/tenant/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                    <SidebarItem to="/tenant/files" icon={<Palette size={18} />} label="Global Styles" />
                    <SidebarItem to="/tenant/teams" icon={<Users size={18} />} label="Teams" />
                    {/* <SidebarItem to="/tenant/settings" icon={<Settings size={18} />} label="Settings" /> */}
                </nav>
                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                    <div className="mb-4 flex items-center gap-3">
                        <div
                            className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-white transition-colors"
                            style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                            T
                        </div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate" title={user?.id}>{user?.id}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900 md:hidden">
                    <span className="font-bold">Tenant Portal</span>
                    <Button size="sm" variant="ghost" onClick={handleLogout}><LogOut size={16} /></Button>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
