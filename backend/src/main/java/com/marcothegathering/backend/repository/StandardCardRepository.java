package com.marcothegathering.backend.repository;

import com.marcothegathering.backend.model.StandardCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface StandardCardRepository extends MongoRepository<StandardCard, String> {

    // Search by name (case-insensitive, partial match)
    List<StandardCard> findByNameContainingIgnoreCase(String name);

    // Filter by colors
    List<StandardCard> findByColorsIn(List<String> colors);

    // Filter by type
    List<StandardCard> findByTypeLineContainingIgnoreCase(String typeLine);

    // Filter by set
    List<StandardCard> findBySetCode(String setCode);

    // Filter by rarity
    List<StandardCard> findByRarity(String rarity);

    // Combined search: name AND type
    @Query("{ 'name': { $regex: ?0, $options: 'i' }, 'typeLine': { $regex: ?1, $options: 'i' } }")
    List<StandardCard> findByNameAndType(String name, String typeLine);
}
