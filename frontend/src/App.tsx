import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import UserList from './pages/users/UserList';
import Profile from './pages/profile/Profile';
import ActivityLogs from './pages/logs/ActivityLogs';
import Reports from './pages/reports/Reports';
import UserReport from './pages/reports/UserReport';
import Settings from './pages/settings/Settings';
import Notifications from './pages/notifications/Notifications';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <SocketProvider>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />

                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <MainLayout>
                                            <Dashboard />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute roles={['admin', 'super_admin']}>
                                        <MainLayout>
                                            <UserList />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute>
                                        <MainLayout>
                                            <Settings />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <MainLayout>
                                            <Profile />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/notifications"
                                element={
                                    <ProtectedRoute>
                                        <MainLayout>
                                            <Notifications />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/activity-logs"
                                element={
                                    <ProtectedRoute roles={['super_admin']}>
                                        <MainLayout>
                                            <ActivityLogs />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/reports"
                                element={
                                    <ProtectedRoute roles={['super_admin']}>
                                        <MainLayout>
                                            <Reports />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/reports/user/:userId"
                                element={
                                    <ProtectedRoute roles={['super_admin']}>
                                        <MainLayout>
                                            <UserReport />
                                        </MainLayout>
                                    </ProtectedRoute>
                                }
                            />

                            {/* Redirect root to dashboard */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            {/* 404 */}
                            <Route
                                path="*"
                                element={
                                    <div className="flex items-center justify-center h-screen">
                                        <div className="text-center">
                                            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                                            <p className="text-xl text-gray-600 mb-4">Page Not Found</p>
                                            <a href="/dashboard" className="text-primary-600 hover:underline">
                                                Go to Dashboard
                                            </a>
                                        </div>
                                    </div>
                                }
                            />
                        </Routes>
                    </BrowserRouter>
                </SocketProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;
