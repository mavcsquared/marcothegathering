import React from 'react';
import { CardSearch } from '../components/features/CardSearch';

export const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl font-display mb-4">
                    <span className="block">Evaluate your</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-mana-accent to-mana-primary">
                        Magic: The Gathering Cards
                    </span>
                </h1>
                <p className="max-w-md mx-auto text-base text-gray-400 sm:text-lg md:text-xl md:max-w-3xl">
                    Search for cards, add them to your collection, and start building.
                </p>
            </div>

            <CardSearch />
        </div>
    );
};
