import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { MyCollection } from './pages/MyCollection';
import { LoginPage } from './pages/LoginPage';
import { OAuthCallback } from './pages/OAuthCallback';
import { AdminPage } from './pages/AdminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mana-accent"></div>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-surface-dark font-sans text-gray-100">
                    <Navbar />

                    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/oauth/callback" element={<OAuthCallback />} />
                            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/collection" element={<ProtectedRoute><MyCollection /></ProtectedRoute>} />
                            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
