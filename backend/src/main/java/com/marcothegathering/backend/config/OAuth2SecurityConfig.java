package com.marcothegathering.backend.config;

import com.marcothegathering.backend.model.User;
import com.marcothegathering.backend.security.JwtTokenProvider;
import com.marcothegathering.backend.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class OAuth2SecurityConfig {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public OAuth2SecurityConfig(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless JWT authentication
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/cards/search/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/login/**", "/oauth2/**").permitAll()
                        // Protected endpoints
                        .requestMatchers("/api/collection/**").authenticated()
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oauth2UserService()))
                        .successHandler((request, response, authentication) -> {
                            // Generate JWT token after successful OAuth login
                            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                            User user = userService.processOAuth2User(oauth2User, "GOOGLE");
                            String token = jwtTokenProvider.generateToken(user);

                            // Redirect to frontend with token
                            String frontendUrl = "http://localhost:3000/oauth/callback?token="
                                    + URLEncoder.encode(token, StandardCharsets.UTF_8);
                            response.sendRedirect(frontendUrl);
                        })
                        .failureHandler((request, response, exception) -> {
                            response.sendRedirect("http://localhost:3000/login?error=oauth_failed");
                        }));

        return http.build();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        return new DefaultOAuth2UserService();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
