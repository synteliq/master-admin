import React from 'react';
import { Card } from '../../../components/ui/Shared';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface TeamData {
    name: string;
    files: number;
    storage: number; // in MB
    members: number;
    [key: string]: any;
}

const COLORS = ['#cf2e2e', '#222', '#666', '#999', '#ccc'];

// Mock Data - In a real app, this would come from the API
const MOCK_DATA: TeamData[] = [
    { name: 'Engineering', files: 120, storage: 450, members: 8 },
    { name: 'Marketing', files: 86, storage: 900, members: 5 },
    { name: 'Sales', files: 45, storage: 120, members: 12 },
    { name: 'Product', files: 60, storage: 300, members: 4 },
    { name: 'HR', files: 25, storage: 50, members: 3 },
];

export const DashboardCharts: React.FC = () => {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Team Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart: Storage & Files */}
                <Card className="p-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Storage Usage & File Activity</h4>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={MOCK_DATA}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" orientation="left" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="files" name="Files" fill="#cf2e2e" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar yAxisId="right" dataKey="storage" name="Storage (MB)" fill="#1f2937" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Pie Chart: Team Distribution */}
                <Card className="p-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Team Composition</h4>
                    <div className="h-72 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={MOCK_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="members"
                                >
                                    {MOCK_DATA.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};
