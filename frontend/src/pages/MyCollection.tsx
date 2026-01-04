import React, { useEffect, useState } from 'react';
import { api, type Card, type ScryfallCard } from '../services/api';
import { CardDisplay } from '../components/features/CardDisplay';

export const MyCollection: React.FC = () => {
    const [cards, setCards] = useState<ScryfallCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const collection = await api.getCollection();
                // Map backend Card entity to ScryfallCard shape for display
                const mappedCards: ScryfallCard[] = collection.map((c: Card) => {
                    const baseCard: ScryfallCard = {
                        id: c.id,
                        name: c.name,
                        mana_cost: c.manaCost,
                        power: c.power,
                        toughness: c.toughness,
                    };

                    // If we have a backImageUrl, this is a double-sided card - reconstruct card_faces
                    if ((c as any).backImageUrl) {
                        baseCard.card_faces = [
                            {
                                image_uris: c.imageUrl ? { normal: c.imageUrl } : undefined
                            },
                            {
                                image_uris: { normal: (c as any).backImageUrl }
                            }
                        ];
                    } else {
                        baseCard.image_uris = c.imageUrl ? { normal: c.imageUrl } : undefined;
                    }

                    return baseCard;
                });
                setCards(mappedCards);
            } catch (error) {
                console.error('Failed to load collection:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, []);

    const handleRemove = (cardId: string) => {
        // Optimistically remove from UI
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
    };

    if (loading) {
        return <div className="text-white text-center py-8">Loading collection...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-display font-bold text-white mb-4">My Collection</h1>
                <p className="text-gray-400">
                    {cards.length} cards saved
                </p>
            </div>

            {cards.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    Your collection is empty. Go to the Dashboard to add some cards!
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cards.map((card) => (
                        <CardDisplay key={card.id} card={card} initialCollected={true} onRemove={handleRemove} />
                    ))}
                </div>
            )}
        </div>
    );
};
