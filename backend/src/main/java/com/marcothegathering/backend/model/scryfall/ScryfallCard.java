package com.marcothegathering.backend.model.scryfall;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public record ScryfallCard(
                String id,
                String name,
                @JsonProperty("mana_cost") String manaCost,
                String power,
                String toughness,
                @JsonProperty("image_uris") Map<String, String> imageUris,
                @JsonProperty("card_faces") List<CardFace> cardFaces,
                @JsonProperty("scryfall_uri") String scryfallUri) {
        public record CardFace(
                        String name,
                        @JsonProperty("image_uris") Map<String, String> imageUris) {
        }
}
