import React, { useEffect, useState } from 'react';
import { Button, Card } from '../../components/ui/Shared';
import { ApiService as MockService } from '../../services/api';
import { TenantFile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { UploadCloud, FileText, Trash2, Download } from 'lucide-react';

export const FileManagement: React.FC = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState<TenantFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const loadFiles = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await MockService.getFiles(user.id);
            setFiles(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [user?.id]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !user?.id) return;
        setUploading(true);
        try {
            await MockService.uploadFile(user.id, e.target.files[0]);
            loadFiles();
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!user?.id) return;
        if (!confirm('Are you sure you want to delete this file?')) return;

        await MockService.deleteFile(user.id, fileId);
        loadFiles();
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Styles</h1>
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label htmlFor="file-upload" className={cn("cursor-pointer inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-ring-brand h-10 px-4 py-2 bg-brand text-white hover:opacity-90 shadow-sm", uploading && "opacity-50 cursor-not-allowed")}>
                        <UploadCloud size={16} className="mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Styles'}
                    </label>
                </div>
            </div>

            <Card className="overflow-hidden">
                {files.length === 0 && !loading ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <UploadCloud size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No styles uploaded</h3>
                        <p className="text-gray-500">Upload global styles to share them securely.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3">File Name</th>
                                    <th className="px-6 py-3">Size</th>
                                    <th className="px-6 py-3">Uploaded</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file) => (
                                    <tr key={file.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                            <FileText size={18} className="text-brand" />
                                            {file.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{formatSize(file.size)}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="text-brand hover:opacity-80">
                                                    <Download size={14} />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(file.id)} className="text-red-600 hover:text-red-700">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
