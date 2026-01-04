package com.marcothegathering.backend.service;

import com.marcothegathering.backend.model.Card;
import com.marcothegathering.backend.model.scryfall.ScryfallCard;
import com.marcothegathering.backend.repository.CardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CollectionService {

    private final CardRepository cardRepository;

    public CollectionService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    public List<Card> getCollection() {
        return cardRepository.findAll();
    }

    public Card addToCollection(ScryfallCard scryfallCard) {
        if (cardRepository.existsById(scryfallCard.id())) {
            return cardRepository.findById(scryfallCard.id()).get();
        }

        Card card = new Card();
        card.setId(scryfallCard.id());
        card.setName(scryfallCard.name());
        card.setManaCost(scryfallCard.manaCost());

        // Handle images: try image_uris first, then card_faces for double-sided cards
        String imageUrl = null;
        String backImageUrl = null;

        if (scryfallCard.imageUris() != null) {
            imageUrl = scryfallCard.imageUris().get("normal");
        } else if (scryfallCard.cardFaces() != null && !scryfallCard.cardFaces().isEmpty()) {
            var firstFace = scryfallCard.cardFaces().get(0);
            if (firstFace.imageUris() != null) {
                imageUrl = firstFace.imageUris().get("normal");
            }
            // Save back face image if it exists
            if (scryfallCard.cardFaces().size() >= 2) {
                var secondFace = scryfallCard.cardFaces().get(1);
                if (secondFace.imageUris() != null) {
                    backImageUrl = secondFace.imageUris().get("normal");
                }
            }
        }
        card.setImageUrl(imageUrl);
        card.setBackImageUrl(backImageUrl);
        card.setPower(scryfallCard.power());
        card.setToughness(scryfallCard.toughness());
        card.setCollected(true);

        return cardRepository.save(card);
    }

    public void removeFromCollection(String id) {
        cardRepository.deleteById(id);
    }
}
