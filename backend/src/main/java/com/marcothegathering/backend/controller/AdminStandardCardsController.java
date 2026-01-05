package com.marcothegathering.backend.controller;

import com.marcothegathering.backend.service.StandardCardsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/admin/standard-cards")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminStandardCardsController {

    private final StandardCardsService standardCardsService;

    public AdminStandardCardsController(StandardCardsService standardCardsService) {
        this.standardCardsService = standardCardsService;
    }

    /**
     * Trigger bulk import of Standard cards (runs asynchronously)
     */
    @PostMapping("/import")
    public ResponseEntity<?> triggerImport() {
        // Run import asynchronously so the request doesn't timeout
        CompletableFuture.runAsync(() -> {
            standardCardsService.importStandardCards();
        });

        return ResponseEntity.ok(Map.of(
                "message", "Import started",
                "status", "in_progress"));
    }

    /**
     * Get cache statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = standardCardsService.getStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Clear the cache (for testing/debugging)
     */
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCache() {
        standardCardsService.clearCache();
        return ResponseEntity.ok(Map.of("message", "Cache cleared"));
    }
}
