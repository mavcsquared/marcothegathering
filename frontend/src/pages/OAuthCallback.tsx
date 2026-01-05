import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const OAuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (token) {
            login(token).then(() => {
                navigate('/');
            }).catch(err => {
                console.error('Login failed:', err);
                navigate('/login?error=token_invalid');
            });
        } else {
            navigate('/login?error=no_token');
        }
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-dark">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mana-accent mx-auto mb-4"></div>
                <p className="text-gray-400">Signing you in...</p>
            </div>
        </div>
    );
};
