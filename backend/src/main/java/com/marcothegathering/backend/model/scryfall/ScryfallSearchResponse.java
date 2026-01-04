package com.marcothegathering.backend.model.scryfall;

import java.util.List;

public record ScryfallSearchResponse(
        String object,
        int total_cards,
        boolean has_more,
        List<ScryfallCard> data) {
}
