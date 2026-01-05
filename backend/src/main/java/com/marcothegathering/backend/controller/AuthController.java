package com.marcothegathering.backend.controller;

import com.marcothegathering.backend.model.User;
import com.marcothegathering.backend.security.JwtTokenProvider;
import com.marcothegathering.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    public AuthController(JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "No token provided"));
        }

        String token = authHeader.substring(7);

        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        String userId = jwtTokenProvider.getUserIdFromToken(token);
        Optional<User> user = userService.getUserById(userId);

        if (user.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.get().getId());
        userInfo.put("email", user.get().getEmail());
        userInfo.put("name", user.get().getName());
        userInfo.put("profilePicture", user.get().getProfilePicture());

        return ResponseEntity.ok(userInfo);
    }
}
