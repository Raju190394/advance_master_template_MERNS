import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Lock, Bell, Globe, Moon, Sun } from 'lucide-react';
import api from '../../services/api';

const Settings: React.FC = () => {
    const { hasRole } = useAuth();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [generalSettings, setGeneralSettings] = useState({
        appName: '',
        supportEmail: '',
    });

    // Removed initial placeholder; values will be loaded from backend

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGeneralSettings({ ...generalSettings, [e.target.name]: e.target.value });
    };

    const saveGeneralSettings = async () => {
        try {
            setLoading(true);
            await api.put('/settings', generalSettings);
            setMessage({ type: 'success', text: 'General settings saved successfully' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const submitPasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            setLoading(true);
            await api.post('/profile/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
            });
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                const data = res.data?.data || {};
                setGeneralSettings({
                    appName: data.appName || '',
                    supportEmail: data.supportEmail || '',
                });
            } catch (err) {
                console.error('Failed to load settings', err);
            }
        };
        fetchSettings();
    }, []);

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Moon },
    ];

    return (
        <div className="space-y-6">
            {message.text && (
                <p className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>{message.text}</p>
            )}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your application preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <Card padding="none" className="md:col-span-1 h-fit">
                    <nav className="flex flex-col p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </Card>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'general' && (
                        <Card title="General Settings">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Application Name
                                    </label>
                                    <Input
                                        name="appName"
                                        value={generalSettings.appName}
                                        onChange={handleGeneralChange}
                                        disabled={!hasRole(['super_admin'])}
                                    />
                                    {!hasRole(['super_admin']) && (
                                        <p className="text-xs text-gray-500 mt-1">Only Super Admins can change this.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Support Email
                                    </label>
                                    <Input
                                        name="supportEmail"
                                        value={generalSettings.supportEmail}
                                        onChange={handleGeneralChange}
                                        disabled={!hasRole(['super_admin'])}
                                    />
                                </div>
                                {hasRole(['super_admin']) && (
                                    <div className="pt-4">
                                        <Button onClick={saveGeneralSettings} loading={loading}>
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card title="Security Settings">
                            <form onSubmit={submitPasswordChange} className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button type="submit" loading={loading}>
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card title="Notification Preferences">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails about your account activity</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Security Alerts</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about suspicious login attempts</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'appearance' && (
                        <Card title="Appearance">
                            <div className="space-y-4">
                                <div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${theme === 'light'
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-primary-600' : 'text-gray-600'}`} />
                                            <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary-900 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>Light</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${theme === 'dark'
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-primary-600' : 'text-gray-600'}`} />
                                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary-900 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>Dark</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('system')}
                                            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${theme === 'system'
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <Globe className={`w-6 h-6 ${theme === 'system' ? 'text-primary-600' : 'text-gray-600'}`} />
                                            <span className={`text-sm font-medium ${theme === 'system' ? 'text-primary-900 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>System</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
