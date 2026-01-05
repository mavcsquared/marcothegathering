import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Layers, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path ? 'text-white bg-surface-lighter' : 'text-gray-300 hover:text-white hover:bg-surface-lighter/50';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-surface-card border-b border-surface-lighter sticky top-0 z-50"
            style={{ zIndex: 100 }}
        >
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 text-mana-accent">
                            <Layers size={32} />
                        </Link>
                        {isAuthenticated && (
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}>Dashboard</Link>
                                    <Link to="/collection" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/collection')}`}>My Collection</Link>
                                    <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')}`}>Admin</Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="hidden md:block">
                        {isAuthenticated && user ? (
                            <div className="ml-4 flex items-center md:ml-6 gap-3">
                                {user.profilePicture && (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="h-8 w-8 rounded-full"
                                    />
                                )}
                                <span className="text-sm text-gray-300">{user.name}</span>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut size={16} className="mr-2" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="ml-4 flex items-center md:ml-6">
                                <Button variant="primary" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="bg-surface-lighter inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-surface-lighter/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-dark focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#" className="text-white block px-3 py-2 rounded-md text-base font-medium">Dashboard</a>
                        <a href="#" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Deck Builder</a>
                        <a href="#" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">My Collection</a>
                    </div>
                    <div className="pt-4 pb-4 border-t border-surface-lighter">
                        <div className="flex items-center px-5">
                            <div className="flex-shrink-0">
                                {/* User Avatar Placeholder */}
                                <div className="h-10 w-10 rounded-full bg-mana-primary flex items-center justify-center text-white font-bold">U</div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium leading-none text-white">Guest User</div>
                                <div className="text-sm font-medium leading-none text-gray-400 mt-1">guest@example.com</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            <Button variant="primary" className="w-full">Sign Up</Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
