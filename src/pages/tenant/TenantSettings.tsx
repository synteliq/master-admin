import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components/ui/Shared';
import { ApiService as MockService } from '../../services/api'; // Aliased for easy swapping
import { useAuth } from '../../contexts/AuthContext';
import { Save, Check } from 'lucide-react';

export const TenantSettings: React.FC = () => {
    const { user } = useAuth();
    const [brandColor, setBrandColor] = useState('#2563eb');
    const [font, setFont] = useState('Inter');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Fetch current settings on load
    useEffect(() => {
        const loadSettings = async () => {
            if (!user?.id) return;
            try {
                const tenant = await MockService.getTenant(user.id);
                if (tenant.settings) {
                    if (tenant.settings.brandColor) {
                        setBrandColor(tenant.settings.brandColor);
                        document.documentElement.style.setProperty('--brand-primary', tenant.settings.brandColor);
                    }
                    if (tenant.settings.font) {
                        setFont(tenant.settings.font);
                        document.documentElement.style.fontFamily =
                            tenant.settings.font === 'Inter' ? '"Inter", sans-serif' :
                                tenant.settings.font === 'Serif' ? 'Georgia, serif' :
                                    tenant.settings.font === 'Mono' ? 'monospace' : 'system-ui';
                    }
                }
            } catch (err) {
                console.error("Failed to load settings", err);
            }
        };
        loadSettings();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            await MockService.updateBranding(user.id, brandColor, font);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);

            // Dynamic CSS updates
            document.documentElement.style.setProperty('--brand-primary', brandColor);
            document.documentElement.style.fontFamily = font === 'Inter' ? '"Inter", sans-serif' :
                font === 'Serif' ? 'Georgia, serif' :
                    font === 'Mono' ? 'monospace' : 'system-ui';

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6" style={{ fontFamily: font === 'Mono' ? 'monospace' : font === 'Serif' ? 'Georgia, serif' : 'inherit' }}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Brand Style</h3>
                        <div className="space-y-6">
                            {/* Color */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                        className="h-10 w-full rounded cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Font */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Typography</label>
                                <select
                                    value={font}
                                    onChange={(e) => setFont(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                                >
                                    <option value="Inter">Modern Sans (Inter)</option>
                                    <option value="Serif">Classic Serif</option>
                                    <option value="Mono">Technical Mono</option>
                                </select>
                            </div>

                            <Button onClick={handleSave} disabled={loading} className="w-full mt-4">
                                {loading ? 'Saving...' : saved ? <><Check size={16} className="mr-2" /> Saved</> : <><Save size={16} className="mr-2" /> Save Changes</>}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Live Preview Panel (UI Kit) */}
                <div className="lg:col-span-2">
                    <Card className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="mb-6">
                            <h3 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Live UI Kit Preview</h3>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Quick Brown Fox</h2>
                            <p className="text-gray-500">Visual validation of your brand settings across components.</p>
                        </div>

                        <div className="space-y-8">
                            {/* Buttons */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-500">Buttons</h4>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        className="px-4 py-2 rounded-md text-white font-medium shadow-sm"
                                        style={{ backgroundColor: brandColor }}
                                    >
                                        Primary Action
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-md border font-medium bg-white dark:bg-transparent dark:text-white"
                                        style={{ borderColor: brandColor, color: brandColor }}
                                    >
                                        Secondary
                                    </button>
                                    <button className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                                        Neutral
                                    </button>
                                </div>
                            </div>

                            {/* Cards & Badges */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: brandColor }}></div>
                                    <h4 className="font-semibold mb-2">Card Component</h4>
                                    <p className="text-sm text-gray-500 mb-3">Cards will inherit your font choice and corner styles.</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800">
                                        Badge
                                    </span>
                                </div>
                                <div className="p-4 rounded-lg text-white" style={{ backgroundColor: brandColor }}>
                                    <h4 className="font-semibold mb-2">Brand Card</h4>
                                    <p className="text-sm opacity-90">Useful for call-to-actions or highlighted stats.</p>
                                </div>
                            </div>

                            {/* Form Elements */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-500">Form Inputs</h4>
                                <div className="max-w-xs">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:ring focus:ring-opacity-50 px-3 py-2 bg-white dark:bg-gray-900 border text-sm"
                                            placeholder="Focused input state..."
                                            style={{ borderColor: brandColor }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
