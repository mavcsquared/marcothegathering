import React, { useState } from 'react';
import { api, type ScryfallCard } from '../../services/api';
import { Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { CardDisplay } from './CardDisplay';

export const CardSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ScryfallCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const cards = await api.searchCards(query);
            setResults(cards);
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl font-display font-bold text-white mb-4">Card Search</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-surface-lighter rounded-md leading-5 bg-surface-darker text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-surface-dark focus:border-mana-primary focus:ring-1 focus:ring-mana-primary sm:text-sm transition-colors"
                            placeholder="Search for a card (e.g. 'Black Lotus', 'Jace')..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={loading} size="lg">
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((card) => (
                    <CardDisplay key={card.id} card={card} />
                ))}
            </div>

            {searched && !loading && results.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                    No cards found matching "{query}".
                </div>
            )}
        </div>
    );
};
