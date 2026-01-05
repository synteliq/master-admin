import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/ui/Shared';
import { ShieldCheck, User, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

export const LoginSelector: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
                {/* Intro Section */}
                <div className="flex flex-col justify-center space-y-6">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Multi-Tenant <span className="text-brand">Master</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        A secure, clean, and modern solution for managing distributed tenant architectures.
                        Log in to manage tenants or access your dedicated workspace.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><ShieldCheck size={16} /> Secure Access</span>
                        <span className="flex items-center gap-1"><Building2 size={16} /> Isolated Data</span>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="space-y-4">
                    <Link to="/admin/login" className="block group">
                        <Card className="p-6 transition-all hover:border-brand hover:shadow-md cursor-pointer group-hover:bg-brand-light dark:group-hover:bg-opacity-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-brand-light flex items-center justify-center text-brand">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Tenant Master</h3>
                                        <p className="text-sm text-gray-500">Manage tenants and settings</p>
                                    </div>
                                </div>
                                <ArrowRight className="text-gray-400 group-hover:text-brand transition-colors" />
                            </div>
                        </Card>
                    </Link>

                    <Link to="/tenant/login" className="block group">
                        <Card className="p-6 transition-all hover:border-green-500 hover:shadow-md cursor-pointer group-hover:bg-green-50/50 dark:group-hover:bg-green-900/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Tenant Access</h3>
                                        <p className="text-sm text-gray-500">Access your organization files</p>
                                    </div>
                                </div>
                                <ArrowRight className="text-gray-400 group-hover:text-green-500 transition-colors" />
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginAdmin(username, password);
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
                    <p className="text-sm text-gray-500">Enter your master credentials</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                        <Input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" isLoading={loading}>
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-sm text-brand hover:opacity-80">← Back to Portal</Link>
                </div>
            </Card>
        </div>
    );
};

export const TenantLogin: React.FC = () => {
    const [tenantId, setTenantId] = useState('tnt_f5pwfw0i');
    const [error, setError] = useState('');
    const { loginTenant, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await loginTenant(tenantId, 'mock-key');
            navigate('/tenant/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <Card className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Login</h2>
                    <p className="text-sm text-gray-500">Access your organization's workspace</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenant ID</label>
                        <Input
                            value={tenantId}
                            onChange={e => setTenantId(e.target.value)}
                            placeholder="tnt_..."
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Access Workspace
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-sm text-brand hover:opacity-80">← Back to Portal</Link>
                </div>
            </Card>
        </div>
    );
};
