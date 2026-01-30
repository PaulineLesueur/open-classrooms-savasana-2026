package com.openclassrooms.starterjwt.security.jwt;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.openclassrooms.starterjwt.security.services.UserDetailsServiceImpl;

import lombok.var;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;

class AuthTokenFilterTest {

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.clearContext(); // clean SecurityContext before each test
    }

    @Test
    void doFilterInternal_validJwt_setsAuthentication() throws ServletException, IOException {
        String token = "valid.jwt.token";
        String username = "testuser";

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtils.validateJwtToken(token)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(token)).thenReturn(username);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        when(userDetails.getAuthorities()).thenReturn(java.util.Collections.emptyList());

        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Check that SecurityContext has authentication set
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(userDetails, SecurityContextHolder.getContext().getAuthentication().getPrincipal());

        // Verify filterChain.doFilter called
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_noAuthorizationHeader_skipsAuthentication() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);

        authTokenFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_invalidJwt_skipsAuthentication() throws ServletException, IOException {
        String token = "invalid.jwt.token";

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtils.validateJwtToken(token)).thenReturn(false);

        authTokenFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_exceptionCaught_logsErrorAndContinues() throws ServletException, IOException {
        String token = "jwt.token";

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtils.validateJwtToken(token)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(token)).thenThrow(new RuntimeException("error"));

        // We expect no exception thrown despite the RuntimeException inside the filter
        assertDoesNotThrow(() -> authTokenFilter.doFilterInternal(request, response, filterChain));

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void parseJwt_returnsTokenWhenHeaderValid() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer mytoken123");

        // Using reflection to test private method parseJwt
        var method = AuthTokenFilter.class.getDeclaredMethod("parseJwt", HttpServletRequest.class);
        method.setAccessible(true);
        String token = (String) method.invoke(authTokenFilter, request);

        assertEquals("mytoken123", token);
    }

    @Test
    void parseJwt_returnsNullWhenHeaderAbsent() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        var method = AuthTokenFilter.class.getDeclaredMethod("parseJwt", HttpServletRequest.class);
        method.setAccessible(true);
        String token = (String) method.invoke(authTokenFilter, request);

        assertNull(token);
    }

    @Test
    void parseJwt_returnsNullWhenHeaderDoesNotStartWithBearer() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Token abcdef");

        var method = AuthTokenFilter.class.getDeclaredMethod("parseJwt", HttpServletRequest.class);
        method.setAccessible(true);
        String token = (String) method.invoke(authTokenFilter, request);

        assertNull(token);
    }
}
