package com.marcothegathering.backend.service;

import com.marcothegathering.backend.model.User;
import com.marcothegathering.backend.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User processOAuth2User(OAuth2User oauth2User, String provider) {
        String providerId = oauth2User.getAttribute("sub"); // Google's user ID
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");

        // Try to find existing user
        Optional<User> existingUser = userRepository.findByProviderAndProviderId(provider, providerId);

        if (existingUser.isPresent()) {
            // Update last login
            User user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        } else {
            // Create new user
            User newUser = new User(email, name, provider, providerId);
            newUser.setProfilePicture(picture);
            return userRepository.save(newUser);
        }
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
}
