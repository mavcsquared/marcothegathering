export interface ScryfallCard {
    id: string;
    name: string;
    mana_cost?: string;
    power?: string;
    toughness?: string;
    image_uris?: {
        small?: string;
        normal?: string;
        large?: string;
        png?: string;
        art_crop?: string;
        border_crop?: string;
    };
    card_faces?: Array<{
        name?: string;
        image_uris?: {
            small?: string;
            normal?: string;
            large?: string;
            png?: string;
            art_crop?: string;
            border_crop?: string;
        };
    }>;
    scryfall_uri?: string;
}

export interface Card {
    id: string; // Scryfall ID
    name: string;
    manaCost?: string;
    typeLine?: string;
    oracleText?: string;
    power?: string;
    toughness?: string;
    imageUrl?: string;
    collected: boolean;
}

const API_BASE_URL = '/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    searchCards: async (query: string): Promise<ScryfallCard[]> => {
        const response = await fetch(`${API_BASE_URL}/cards/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch cards');
        }
        return response.json();
    },

    addToCollection: async (card: ScryfallCard): Promise<Card> => {
        const response = await fetch(`${API_BASE_URL}/collection`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(card),
        });
        if (response.status === 401) {
            throw new Error('Unauthorized - please login');
        }
        if (!response.ok) {
            throw new Error('Failed to add card to collection');
        }
        return response.json();
    },

    getCollection: async (): Promise<Card[]> => {
        const response = await fetch(`${API_BASE_URL}/collection`, {
            headers: getAuthHeaders()
        });
        if (response.status === 401) {
            throw new Error('Unauthorized - please login');
        }
        if (!response.ok) {
            throw new Error('Failed to fetch collection');
        }
        return response.json();
    },

    removeFromCollection: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/collection/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.status === 401) {
            throw new Error('Unauthorized - please login');
        }
        if (!response.ok) {
            throw new Error('Failed to remove card from collection');
        }
    }
};
