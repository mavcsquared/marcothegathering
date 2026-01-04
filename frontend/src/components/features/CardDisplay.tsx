import React, { useState } from 'react';
import type { ScryfallCard } from '../../services/api';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Plus, Check, FlipHorizontal2 } from 'lucide-react';

interface CardDisplayProps {
    card: ScryfallCard;
    initialCollected?: boolean;
    onRemove?: (cardId: string) => void;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, initialCollected = false, onRemove }) => {
    const [isAdded, setIsAdded] = useState(initialCollected);
    const [loading, setLoading] = useState(false);
    const [showingFront, setShowingFront] = useState(true);

    const isDoubleSided = card.card_faces && card.card_faces.length >= 2;

    const handleAdd = async () => {
        setLoading(true);
        try {
            await api.addToCollection(card);
            setIsAdded(true);
        } catch (error) {
            console.error('Failed to add card', error);
            // TODO: toast notification
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        setLoading(true);
        try {
            await api.removeFromCollection(card.id);
            setIsAdded(false);
            if (onRemove) {
                onRemove(card.id);
            }
        } catch (error) {
            console.error('Failed to remove card', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle double-sided cards (like transform cards) which have card_faces instead of image_uris
    const getFaceImage = (faceIndex: number) => {
        if (isDoubleSided && card.card_faces) {
            return card.card_faces[faceIndex]?.image_uris?.normal || 'https://via.placeholder.com/488x680?text=No+Image';
        }
        return card.image_uris?.normal || 'https://via.placeholder.com/488x680?text=No+Image';
    };

    return (
        <div className="bg-surface-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full border border-surface-lighter transition-transform hover:scale-105 duration-200">
            <div className="relative aspect-[2.5/3.5] bg-surface-darker" style={{ perspective: '1000px' }}>
                <div
                    className="relative w-full h-full transition-transform duration-700"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: showingFront ? 'rotateY(0deg)' : 'rotateY(180deg)'
                    }}
                >
                    {/* Front face */}
                    <img
                        src={getFaceImage(0)}
                        alt={card.name}
                        className="absolute w-full h-full object-cover"
                        loading="lazy"
                        style={{ backfaceVisibility: 'hidden' }}
                    />

                    {/* Back face (only for double-sided cards) */}
                    {isDoubleSided && (
                        <img
                            src={getFaceImage(1)}
                            alt={`${card.name} (back)`}
                            className="absolute w-full h-full object-cover"
                            loading="lazy"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                            }}
                        />
                    )}
                </div>
                {isDoubleSided && (
                    <button
                        onClick={() => setShowingFront(!showingFront)}
                        className="absolute top-12 right-6 bg-surface-dark/90 hover:bg-surface-lighter/90 text-white p-2 rounded-md transition-all backdrop-blur-sm z-10 hover:scale-110 opacity-60"
                        title={showingFront ? 'Show back face' : 'Show front face'}
                        aria-label="Flip card"
                    >
                        <FlipHorizontal2 size={20} className="transition-transform" />
                    </button>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-display font-bold text-white mb-2" title={card.name}>
                    {card.name}
                </h3>

                <div className="mt-auto">
                    {onRemove ? (
                        <Button
                            variant="ghost"
                            className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={handleRemove}
                            disabled={loading}
                        >
                            {loading ? 'Removing...' : 'Remove from Collection'}
                        </Button>
                    ) : isAdded ? (
                        <Button
                            variant="ghost"
                            className="w-full text-green-400 hover:text-green-300 hover:bg-green-400/10 cursor-default"
                            disabled
                        >
                            <Check size={16} className="mr-2" />
                            Added to Collection
                        </Button>
                    ) : (
                        <Button
                            className="w-full justify-center group"
                            onClick={handleAdd}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="animate-pulse">Adding...</span>
                            ) : (
                                <>
                                    <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" />
                                    Add to Collection
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
