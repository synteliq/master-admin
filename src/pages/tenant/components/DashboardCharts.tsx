import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Shared';
import { ApiService as MockService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface TeamUsage {
    team_name: string;
    total_tokens_in: number;
    total_tokens_out: number;
    total_cost: number;
}

interface UserUsage {
    email: string;
    team_name: string;
    total_cost: number;
    total_tokens: number;
}



export const DashboardCharts: React.FC = () => {
    const { user } = useAuth();
    const [teamUsage, setTeamUsage] = useState<TeamUsage[]>([]);
    const [userUsage, setUserUsage] = useState<UserUsage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsage = async () => {
            if (!user?.id) return;
            try {
                const data = await MockService.getTenantUsage(user.id);
                setTeamUsage(data.teamUsage);
                setUserUsage(data.userUsage);
            } catch (e) {
                console.error("Failed to load usage", e);
            } finally {
                setLoading(false);
            }
        };
        loadUsage();
    }, [user?.id]);

    if (loading) {
        return <div className="text-gray-500 text-sm">Loading usage stats...</div>;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Token Usage Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart: Team Cost */}
                <Card className="p-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Cost by Team ($)</h4>
                    <div className="h-72">
                        {teamUsage.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={teamUsage}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="team_name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="total_cost" name="Cost ($)" fill="#cf2e2e" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">No usage data available</div>
                        )}
                    </div>
                </Card>

                {/* Table: Top Users */}
                <Card className="p-6 overflow-hidden">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Users by Cost</h4>
                    <div className="h-72 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-2">User</th>
                                    <th className="px-4 py-2">Team</th>
                                    <th className="px-4 py-2 text-right">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userUsage.map((u, i) => (
                                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="px-4 py-2 font-medium">{u.email}</td>
                                        <td className="px-4 py-2 text-gray-500">{u.team_name}</td>
                                        <td className="px-4 py-2 text-right font-mono">${u.total_cost.toFixed(4)}</td>
                                    </tr>
                                ))}
                                {userUsage.length === 0 && (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No user activity yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};
