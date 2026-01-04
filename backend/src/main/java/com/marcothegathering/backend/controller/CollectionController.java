package com.marcothegathering.backend.controller;

import com.marcothegathering.backend.model.Card;
import com.marcothegathering.backend.model.scryfall.ScryfallCard;
import com.marcothegathering.backend.service.CollectionService;
import com.marcothegathering.backend.service.ScryfallService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collection")
@CrossOrigin(origins = "http://localhost:3000")
public class CollectionController {

    private final CollectionService collectionService;
    private final ScryfallService scryfallService;

    public CollectionController(CollectionService collectionService, ScryfallService scryfallService) {
        this.collectionService = collectionService;
        this.scryfallService = scryfallService;
    }

    @GetMapping
    public List<Card> getCollection() {
        return collectionService.getCollection();
    }

    @PostMapping
    public ResponseEntity<Card> addToCollection(@RequestBody ScryfallCard scryfallCard) {
        // If the frontend sends a full Scryfall object, we use it directly.
        // Alternatively, we could accept just an ID and fetch it here, but sending the
        // object saves an API call.
        Card savedCard = collectionService.addToCollection(scryfallCard);
        return ResponseEntity.ok(savedCard);
    }

    @PostMapping("/{id}")
    public ResponseEntity<Card> addCardById(@PathVariable String id) {
        ScryfallCard card = scryfallService.getCard(id);
        if (card != null) {
            Card savedCard = collectionService.addToCollection(card);
            return ResponseEntity.ok(savedCard);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCollection(@PathVariable String id) {
        collectionService.removeFromCollection(id);
        return ResponseEntity.ok().build();
    }
}
