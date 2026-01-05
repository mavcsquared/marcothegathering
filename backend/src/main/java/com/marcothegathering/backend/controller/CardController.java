package com.marcothegathering.backend.controller;

import com.marcothegathering.backend.model.StandardCard;
import com.marcothegathering.backend.model.scryfall.ScryfallCard;
import com.marcothegathering.backend.service.ScryfallService;
import com.marcothegathering.backend.service.StandardCardsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend dev server
public class CardController {

    private final ScryfallService scryfallService;
    private final StandardCardsService standardCardsService;

    public CardController(ScryfallService scryfallService, StandardCardsService standardCardsService) {
        this.scryfallService = scryfallService;
        this.standardCardsService = standardCardsService;
    }

    @GetMapping("/search")
    public List<ScryfallCard> searchCards(@RequestParam String q) {
        // First, try to search local cache
        List<StandardCard> localResults = standardCardsService.searchLocalCards(q);

        if (!localResults.isEmpty()) {
            // Convert StandardCard to ScryfallCard format
            return localResults.stream()
                    .map(this::convertToScryfallCard)
                    .collect(Collectors.toList());
        }

        // Fall back to Scryfall API if no local results
        return scryfallService.searchCards(q);
    }

    /**
     * Convert StandardCard to ScryfallCard format for frontend compatibility
     */
    private ScryfallCard convertToScryfallCard(StandardCard card) {
        // Build image URIs map
        java.util.Map<String, String> imageUris = null;
        if (card.getImageUrl() != null) {
            imageUris = new java.util.HashMap<>();
            imageUris.put("normal", card.getImageUrl());
        }

        // Build card faces for double-sided cards
        List<ScryfallCard.CardFace> cardFaces = null;
        if (card.getBackImageUrl() != null && card.getImageUrl() != null) {
            java.util.Map<String, String> frontImageUris = new java.util.HashMap<>();
            frontImageUris.put("normal", card.getImageUrl());

            java.util.Map<String, String> backImageUris = new java.util.HashMap<>();
            backImageUris.put("normal", card.getBackImageUrl());

            cardFaces = List.of(
                    new ScryfallCard.CardFace(card.getName(), frontImageUris),
                    new ScryfallCard.CardFace(null, backImageUris));
        }

        return new ScryfallCard(
                card.getId(),
                card.getName(),
                card.getManaCost(),
                card.getPower(),
                card.getToughness(),
                imageUris,
                cardFaces,
                null // scryfall_uri not needed for cached cards
        );
    }
}
