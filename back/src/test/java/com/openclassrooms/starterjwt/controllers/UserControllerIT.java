package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class UserControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserService userService;

    private User createUser(String email, String firstName, String lastName) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        return userRepository.save(user);
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    public void testFindById_ShouldReturnUserDto() throws Exception {
        User user = createUser("user1@example.com", "Alice", "Smith");

        mockMvc.perform(get("/api/user/{id}", user.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user1@example.com"))
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Smith"));
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    public void testFindById_ShouldReturn404WhenUserNotFound() throws Exception {
        mockMvc.perform(get("/api/user/{id}", 9999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    public void testFindById_ShouldReturn400WhenIdIsInvalid() throws Exception {
        mockMvc.perform(get("/api/user/abc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    public void testDelete_ShouldDeleteUserWhenAuthorized() throws Exception {
        User user = createUser("user1@example.com", "Alice", "Smith");

        mockMvc.perform(delete("/api/user/{id}", user.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Vérifier que l'utilisateur a bien été supprimé
        assertFalse(userRepository.findById(user.getId()).isPresent());
    }

    @Test
    @WithMockUser(username = "otheruser@example.com")
    public void testDelete_ShouldReturnUnauthorizedWhenUserIsDifferent() throws Exception {
        User user = createUser("user1@example.com", "Alice", "Smith");

        mockMvc.perform(delete("/api/user/{id}", user.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        // L'utilisateur doit toujours exister
        assertTrue(userRepository.findById(user.getId()).isPresent());
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    public void testDelete_ShouldReturnNotFoundWhenUserNotExist() throws Exception {
        mockMvc.perform(delete("/api/user/{id}", 9999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user1@example.com")
    public void testDelete_ShouldReturnBadRequestWhenIdInvalid() throws Exception {
        mockMvc.perform(delete("/api/user/abc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}
