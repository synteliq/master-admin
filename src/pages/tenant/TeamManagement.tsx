import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, Input, Modal, Badge } from '../../components/ui/Shared';
import { ApiService as MockService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Team } from '../../types';
import { Plus, Search, Cpu, Pencil, Upload } from 'lucide-react';

export const TeamManagement: React.FC = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    console.log('TeamManagement Render. User:', user);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [name, setName] = useState('');
    const [provider, setProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
    const [model, setModel] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [styles, setStyles] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadTeams = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await MockService.getTeams(user.id);
            setTeams(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTeams(); }, [user?.id]);

    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            openModal();
            // Clear param so it doesn't reopen on refresh
            setSearchParams({}, { replace: true });
        }
    }, [searchParams]);

    const openModal = (team?: Team) => {
        setError(null);
        if (team) {
            setEditingTeam(team);
            setName(team.name);
            setProvider(team.provider as any);
            setModel(team.model || '');
            setApiKey(team.apiKey || '');
            setStyles(team.styles || '');
        } else {
            setEditingTeam(null);
            setName('');
            setProvider('openai');
            setModel('');
            setApiKey('');
            setStyles('');
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setError(null);
        if (!user?.id || !name) {
            if (!user?.id) setError('User session invalid. Please reload.');
            else setError('Please provide a team name.');
            return;
        }
        try {
            if (editingTeam) {
                // Update
                await MockService.updateTeam(user.id, editingTeam.id, {
                    name,
                    provider,
                    model: model || 'default',
                    apiKey,
                    styles
                });
            } else {
                // Create
                await MockService.createTeam(user.id, {
                    name,
                    provider,
                    model: model || 'default',
                    apiKey,
                    styles
                });
            }

            setIsModalOpen(false);
            loadTeams();
        } catch (e: any) {
            console.error("Failed to save team", e);
            setError(e.message || 'Failed to save team');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setStyles(content);
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure AI models and providers for your different teams.</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus size={16} className="mr-2" /> New Team
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search teams..." className="pl-9" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3">Team Name</th>
                                <th className="px-6 py-3">Team ID</th>
                                <th className="px-6 py-3">Team Key</th>
                                <th className="px-6 py-3">Provider</th>
                                <th className="px-6 py-3">Model Config</th>
                                <th className="px-6 py-3">Created</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
                            ) : teams.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No teams found. Create your first team!</td></tr>
                            ) : teams.map((team) => (
                                <tr key={team.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900 dark:text-white">{team.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded select-all text-gray-600 dark:text-gray-400">
                                            {team.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded select-all  text-brand-600 dark:text-brand-400 font-medium">
                                            {team.teamKey || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="default" className="uppercase text-xs">{team.provider}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Cpu size={14} />
                                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{team.model}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(team.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <Button size="sm" variant="ghost" onClick={() => openModal(team)}>
                                            <Pencil size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTeam ? "Edit Team" : "Add New Team"}>
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Team Name</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Content Marketing"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">AI Provider</label>
                        <div className="flex gap-2">
                            {['openai', 'anthropic', 'gemini'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setProvider(p as any)}
                                    className={`flex-1 py-2 px-3 rounded-md border text-sm capitalize transition-colors ${provider === p ? 'bg-brand text-white border-brand ring-1 ring-brand' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">API Key</label>
                        <Input
                            type="password"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder="sk-..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Key for accessing the provider's API.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Model Name</label>
                        {provider === 'gemini' ? (
                            <div className="space-y-2">
                                <select
                                    value={model}
                                    onChange={e => setModel(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                                >
                                    <option value="" disabled>Select a Model</option>
                                    <option value="gemini-2.5-flash">gemini-2.5-flash (NEW)</option>
                                    <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Recommended)</option>
                                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                                </select>
                                <p className="text-xs text-gray-500">Select a supported Gemini model.</p>
                            </div>
                        ) : (
                            <>
                                <Input
                                    value={model}
                                    onChange={e => setModel(e.target.value)}
                                    placeholder={provider === 'openai' ? 'gpt-4-turbo' : 'claude-3-opus'}
                                />
                                <p className="text-xs text-gray-500 mt-1">Specify the exact model identifier.</p>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium">Global Styles</label>
                            <div className="flex items-center gap-2">
                                {styles && <span className="text-xs text-green-600 flex items-center gap-1">✓ Styles loaded</span>}
                                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => fileInputRef.current?.click()}>
                                    <Upload size={12} className="mr-1" /> Upload Components/Styles
                                </Button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".css,.txt,.json,.tsx,.jsx,.ts,.js,.md"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{editingTeam ? 'Save Changes' : 'Create Team'}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
