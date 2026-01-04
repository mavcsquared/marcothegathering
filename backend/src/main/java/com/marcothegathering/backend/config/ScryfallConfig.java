package com.marcothegathering.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ScryfallConfig {

    @Bean
    public RestClient scryfallRestClient() {
        return RestClient.builder()
                .baseUrl("https://api.scryfall.com")
                .build();
    }
}
