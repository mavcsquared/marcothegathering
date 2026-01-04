package com.marcothegathering.backend.service;

import com.marcothegathering.backend.model.scryfall.ScryfallCard;
import com.marcothegathering.backend.model.scryfall.ScryfallSearchResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

@Service
public class ScryfallService {

    private final RestClient restClient;

    public ScryfallService(RestClient restClient) {
        this.restClient = restClient;
    }

    public List<ScryfallCard> searchCards(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        try {
            ScryfallSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/cards/search")
                            .queryParam("q", query)
                            .build())
                    .retrieve()
                    .body(ScryfallSearchResponse.class);

            return response != null ? response.data() : Collections.emptyList();
        } catch (Exception e) {
            // TODO: Better error handling / logging
            return Collections.emptyList();
        }
    }

    public ScryfallCard getCard(String id) {
        return restClient.get()
                .uri("/cards/{id}", id)
                .retrieve()
                .body(ScryfallCard.class);
    }
}
