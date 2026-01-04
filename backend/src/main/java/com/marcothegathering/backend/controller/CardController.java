package com.marcothegathering.backend.controller;

import com.marcothegathering.backend.model.scryfall.ScryfallCard;
import com.marcothegathering.backend.service.ScryfallService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend dev server
public class CardController {

    private final ScryfallService scryfallService;

    public CardController(ScryfallService scryfallService) {
        this.scryfallService = scryfallService;
    }

    @GetMapping("/search")
    public List<ScryfallCard> searchCards(@RequestParam String q) {
        return scryfallService.searchCards(q);
    }
}
