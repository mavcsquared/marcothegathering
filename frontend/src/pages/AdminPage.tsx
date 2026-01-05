import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';

interface CacheStats {
    totalCards: number;
    lastUpdated: string;
}

export const AdminPage: React.FC = () => {
    const [stats, setStats] = useState<CacheStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/standard-cards/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleImport = async () => {
        setImporting(true);
        setMessage({ text: 'Import started... This may take a few minutes.', type: 'info' });

        try {
            const response = await fetch('/api/admin/standard-cards/import', {
                method: 'POST',
            });

            if (response.ok) {
                setMessage({ text: 'Import started successfully! Check back in a few minutes.', type: 'success' });

                // Poll for updated stats every 5 seconds
                const pollInterval = setInterval(async () => {
                    await fetchStats();
                    // Stop polling after 2 minutes (import should be done by then)
                }, 5000);

                setTimeout(() => {
                    clearInterval(pollInterval);
                    setImporting(false);
                    fetchStats();
                }, 120000); // 2 minutes
            } else {
                setMessage({ text: 'Failed to start import', type: 'error' });
                setImporting(false);
            }
        } catch (error) {
            setMessage({ text: 'Error starting import: ' + error, type: 'error' });
            setImporting(false);
        }
    };

    const handleClearCache = async () => {
        if (!confirm('Are you sure you want to clear the entire card cache?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/admin/standard-cards/clear', {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessage({ text: 'Cache cleared successfully', type: 'success' });
                fetchStats();
            } else {
                setMessage({ text: 'Failed to clear cache', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Error clearing cache: ' + error, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-400">
                    Manage the Standard cards cache
                </p>
            </div>

            {/* Cache Statistics */}
            <div className="bg-surface-card rounded-lg border border-surface-lighter p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Cache Statistics</h2>

                {stats ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Cards Cached:</span>
                            <span className="text-2xl font-bold text-mana-accent">
                                {stats.totalCards.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Last Updated:</span>
                            <span className="text-white">
                                {new Date(stats.lastUpdated).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500">Loading stats...</div>
                )}
            </div>

            {/* Actions */}
            <div className="bg-surface-card rounded-lg border border-surface-lighter p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>

                <div className="space-y-4">
                    <div>
                        <Button
                            variant="primary"
                            onClick={handleImport}
                            disabled={importing || loading}
                            className="w-full sm:w-auto"
                        >
                            {importing ? 'Importing...' : 'Import Standard Cards'}
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                            Downloads all Standard-legal cards from Scryfall (~2000 cards)
                        </p>
                    </div>

                    <div>
                        <Button
                            variant="secondary"
                            onClick={handleClearCache}
                            disabled={importing || loading}
                            className="w-full sm:w-auto"
                        >
                            Clear Cache
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                            Removes all cached cards from the database
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {message && (
                <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-800' :
                        message.type === 'error' ? 'bg-red-900/20 text-red-400 border border-red-800' :
                            'bg-blue-900/20 text-blue-400 border border-blue-800'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Information */}
            <div className="bg-surface-card rounded-lg border border-surface-lighter p-6">
                <h2 className="text-xl font-semibold text-white mb-4">About Card Caching</h2>
                <div className="text-gray-400 space-y-2 text-sm">
                    <p>
                        The card cache stores all Standard-legal cards locally for faster searches and reduced API calls to Scryfall.
                    </p>
                    <p>
                        <strong className="text-white">Benefits:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Instant search results (no network delays)</li>
                        <li>No rate limiting issues</li>
                        <li>Works offline after initial import</li>
                        <li>Enables advanced features like autocomplete</li>
                    </ul>
                    <p className="mt-4">
                        <strong className="text-white">When to refresh:</strong> After new set releases or when Standard rotation occurs.
                    </p>
                </div>
            </div>
        </div>
    );
};
