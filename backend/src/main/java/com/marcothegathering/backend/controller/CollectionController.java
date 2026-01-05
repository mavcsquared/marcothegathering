package com.marcothegathering.backend.controller;

import com.marcothegathering.backend.model.Card;
import com.marcothegathering.backend.model.scryfall.ScryfallCard;
import com.marcothegathering.backend.security.JwtTokenProvider;
import com.marcothegathering.backend.service.CollectionService;
import com.marcothegathering.backend.service.ScryfallService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collection")
@CrossOrigin(origins = "http://localhost:3000")
public class CollectionController {

    private final CollectionService collectionService;
    private final ScryfallService scryfallService;
    private final JwtTokenProvider jwtTokenProvider;

    public CollectionController(CollectionService collectionService, ScryfallService scryfallService,
            JwtTokenProvider jwtTokenProvider) {
        this.collectionService = collectionService;
        this.scryfallService = scryfallService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private String extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("No valid authorization token");
        }
        String token = authHeader.substring(7);
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    @GetMapping
    public ResponseEntity<?> getCollection(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String userId = extractUserId(authHeader);
            List<Card> collection = collectionService.getCollection(userId);
            return ResponseEntity.ok(collection);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
    }

    @PostMapping
    public ResponseEntity<?> addToCollection(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ScryfallCard scryfallCard) {
        try {
            String userId = extractUserId(authHeader);
            Card savedCard = collectionService.addToCollection(userId, scryfallCard);
            return ResponseEntity.ok(savedCard);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> addCardById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        try {
            String userId = extractUserId(authHeader);
            ScryfallCard card = scryfallService.getCard(id);
            if (card != null) {
                Card savedCard = collectionService.addToCollection(userId, card);
                return ResponseEntity.ok(savedCard);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCollection(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        try {
            String userId = extractUserId(authHeader);
            collectionService.removeFromCollection(userId, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
    }
}
