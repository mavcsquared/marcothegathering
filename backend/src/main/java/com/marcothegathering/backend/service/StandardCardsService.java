package com.marcothegathering.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marcothegathering.backend.model.StandardCard;
import com.marcothegathering.backend.repository.StandardCardRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StandardCardsService {

    private static final Logger log = LoggerFactory.getLogger(StandardCardsService.class);
    private static final String BULK_DATA_URL = "https://api.scryfall.com/bulk-data";
    private static final int BATCH_SIZE = 1000;

    private final StandardCardRepository standardCardRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public StandardCardsService(StandardCardRepository standardCardRepository) {
        this.standardCardRepository = standardCardRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Import all Standard-legal cards from Scryfall bulk data
     */
    public Map<String, Object> importStandardCards() {
        Map<String, Object> result = new HashMap<>();

        try {
            log.info("Starting Standard cards import...");

            // Clear existing cache to prevent duplicates
            log.info("Clearing existing cache...");
            standardCardRepository.deleteAll();

            // Step 1: Get bulk data metadata
            String bulkDataResponse = restTemplate.getForObject(BULK_DATA_URL, String.class);
            JsonNode bulkDataNode = objectMapper.readTree(bulkDataResponse);

            // Step 2: Find the "Default Cards" download URL
            String downloadUrl = null;
            for (JsonNode dataNode : bulkDataNode.get("data")) {
                if ("default_cards".equals(dataNode.get("type").asText())) {
                    downloadUrl = dataNode.get("download_uri").asText();
                    break;
                }
            }

            if (downloadUrl == null) {
                throw new RuntimeException("Could not find bulk data download URL");
            }

            log.info("Downloading bulk data from: {}", downloadUrl);

            // Step 3: Download and parse the bulk JSON
            String bulkCardsJson = restTemplate.getForObject(downloadUrl, String.class);
            JsonNode allCardsNode = objectMapper.readTree(bulkCardsJson);

            // Step 4: Filter for Standard-legal cards and convert to StandardCard entities
            List<StandardCard> standardCards = new ArrayList<>();
            java.util.Set<String> seenCardNames = new java.util.HashSet<>(); // Track unique card names
            int totalProcessed = 0;
            int standardCount = 0;
            int duplicatesSkipped = 0;

            for (JsonNode cardNode : allCardsNode) {
                totalProcessed++;

                // Check if card is Standard-legal
                JsonNode legalities = cardNode.get("legalities");
                if (legalities != null && legalities.has("standard")) {
                    String standardLegality = legalities.get("standard").asText();
                    if ("legal".equals(standardLegality)) {
                        String cardName = cardNode.get("name").asText();

                        // Skip if we've already seen this card name (avoid duplicate printings)
                        if (seenCardNames.contains(cardName)) {
                            duplicatesSkipped++;
                            continue;
                        }

                        StandardCard card = convertToStandardCard(cardNode);
                        if (card != null) {
                            standardCards.add(card);
                            seenCardNames.add(cardName);
                            standardCount++;

                            // Batch insert every BATCH_SIZE cards
                            if (standardCards.size() >= BATCH_SIZE) {
                                standardCardRepository.saveAll(standardCards);
                                log.info("Imported {} cards ({} total, {} duplicates skipped)",
                                        standardCards.size(), standardCount, duplicatesSkipped);
                                standardCards.clear();
                            }
                        }
                    }
                }
            }

            // Save remaining cards
            if (!standardCards.isEmpty()) {
                standardCardRepository.saveAll(standardCards);
                log.info("Imported final {} cards", standardCards.size());
            }

            log.info(
                    "Import complete! Processed {} total cards, imported {} unique Standard cards, skipped {} duplicate printings",
                    totalProcessed, standardCount, duplicatesSkipped);

            result.put("success", true);
            result.put("totalProcessed", totalProcessed);
            result.put("standardCardsImported", standardCount);
            result.put("timestamp", LocalDateTime.now());

        } catch (Exception e) {
            log.error("Error importing Standard cards", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * Convert Scryfall JSON to StandardCard entity
     */
    private StandardCard convertToStandardCard(JsonNode cardNode) {
        try {
            StandardCard card = new StandardCard();

            card.setId(cardNode.get("id").asText());
            card.setName(cardNode.get("name").asText());
            card.setManaCost(cardNode.has("mana_cost") ? cardNode.get("mana_cost").asText() : null);
            card.setTypeLine(cardNode.has("type_line") ? cardNode.get("type_line").asText() : null);
            card.setOracleText(cardNode.has("oracle_text") ? cardNode.get("oracle_text").asText() : null);
            card.setPower(cardNode.has("power") ? cardNode.get("power").asText() : null);
            card.setToughness(cardNode.has("toughness") ? cardNode.get("toughness").asText() : null);
            card.setRarity(cardNode.has("rarity") ? cardNode.get("rarity").asText() : null);
            card.setSetCode(cardNode.has("set") ? cardNode.get("set").asText() : null);

            // Extract colors
            if (cardNode.has("colors")) {
                List<String> colors = new ArrayList<>();
                for (JsonNode colorNode : cardNode.get("colors")) {
                    colors.add(colorNode.asText());
                }
                card.setColors(colors);
            }

            // Extract image URLs
            if (cardNode.has("image_uris")) {
                JsonNode imageUris = cardNode.get("image_uris");
                card.setImageUrl(imageUris.has("normal") ? imageUris.get("normal").asText() : null);
            } else if (cardNode.has("card_faces")) {
                // Double-sided card
                JsonNode cardFaces = cardNode.get("card_faces");
                if (cardFaces.size() > 0) {
                    JsonNode frontFace = cardFaces.get(0);
                    if (frontFace.has("image_uris")) {
                        card.setImageUrl(frontFace.get("image_uris").get("normal").asText());
                    }
                }
                if (cardFaces.size() > 1) {
                    JsonNode backFace = cardFaces.get(1);
                    if (backFace.has("image_uris")) {
                        card.setBackImageUrl(backFace.get("image_uris").get("normal").asText());
                    }
                }
            }

            return card;

        } catch (Exception e) {
            log.warn("Error converting card: {}", cardNode.get("name").asText(), e);
            return null;
        }
    }

    /**
     * Search local Standard cards cache
     */
    public List<StandardCard> searchLocalCards(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return standardCardRepository.findByNameContainingIgnoreCase(query.trim());
    }

    /**
     * Get cache statistics
     */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalCards = standardCardRepository.count();
        stats.put("totalCards", totalCards);
        stats.put("lastUpdated", LocalDateTime.now()); // Could track this in a separate metadata collection
        return stats;
    }

    /**
     * Clear all cached cards (useful for testing/re-import)
     */
    public void clearCache() {
        log.info("Clearing Standard cards cache...");
        standardCardRepository.deleteAll();
        log.info("Cache cleared");
    }
}
