package com.openclassrooms.starterjwt.security.jwt;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;

import io.jsonwebtoken.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        jwtUtils = new JwtUtils();
        jwtUtils.jwtSecret = "testSecretKey1234567890";
        jwtUtils.jwtExpirationMs = 3600000;
    }

    @Test
    void generateJwtToken_shouldReturnValidToken() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .username("testuser")
                .build();

        when(authentication.getPrincipal()).thenReturn(userDetails);

        String token = jwtUtils.generateJwtToken(authentication);

        assertNotNull(token);
        String usernameFromToken = jwtUtils.getUserNameFromJwtToken(token);
        assertEquals("testuser", usernameFromToken);
    }

    @Test
    void getUserNameFromJwtToken_shouldReturnUsername() {
        String token = Jwts.builder()
                .setSubject("myusername")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(SignatureAlgorithm.HS512, jwtUtils.jwtSecret)
                .compact();

        String username = jwtUtils.getUserNameFromJwtToken(token);

        assertEquals("myusername", username);
    }

    @Test
    void validateJwtToken_shouldReturnTrueForValidToken() {
        String token = Jwts.builder()
                .setSubject("user")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(SignatureAlgorithm.HS512, jwtUtils.jwtSecret)
                .compact();

        assertTrue(jwtUtils.validateJwtToken(token));
    }

    @Test
    void validateJwtToken_shouldReturnFalseForInvalidSignature() {
        String token = Jwts.builder()
                .setSubject("user")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(SignatureAlgorithm.HS512, "wrongSecret")
                .compact();

        assertFalse(jwtUtils.validateJwtToken(token));
    }

    @Test
    void validateJwtToken_shouldReturnFalseForMalformedToken() {
        String malformedToken = "this.is.not.a.jwt";

        assertFalse(jwtUtils.validateJwtToken(malformedToken));
    }

    @Test
    void validateJwtToken_shouldReturnFalseForExpiredToken() throws InterruptedException {
        String token = Jwts.builder()
                .setSubject("user")
                .setIssuedAt(new Date(System.currentTimeMillis() - 10000))
                .setExpiration(new Date(System.currentTimeMillis() - 5000))
                .signWith(SignatureAlgorithm.HS512, jwtUtils.jwtSecret)
                .compact();

        assertFalse(jwtUtils.validateJwtToken(token));
    }

    @Test
    void validateJwtToken_shouldReturnFalseForUnsupportedToken() {
        assertFalse(jwtUtils.validateJwtToken(null));
        assertFalse(jwtUtils.validateJwtToken(""));
    }

    @Test
    void validateJwtToken_shouldReturnFalseForEmptyClaims() {
        assertFalse(jwtUtils.validateJwtToken(""));
    }
}
