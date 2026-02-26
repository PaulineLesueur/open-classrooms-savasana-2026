package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SessionControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Session session;
    private User user;

    @BeforeEach
    public void setup() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();

        user = createTestUser();
        user = userRepository.save(user);

        session = new Session();
        session.setName("Session Test");
        session.setDescription("Description test");
        session.setDate(new Date());
        session.setUsers(new ArrayList<>());
        session.getUsers().add(user);
        session = sessionRepository.save(session);
    }

    private User createTestUser() {
        User u = new User();
        u.setFirstName("Test");
        u.setLastName("User");
        u.setEmail("testuser@example.com");
        u.setPassword("password");
        u.setAdmin(false);
        return u;
    }

    @Test
    @WithMockUser
    public void testFindAll_ShouldReturnSessions() throws Exception {
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Session Test")));
    }

    @Test
    @WithMockUser
    public void testFindById_ExistingId_ShouldReturnSession() throws Exception {
        mockMvc.perform(get("/api/session/{id}", session.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Session Test")));
    }

    @Test
    @WithMockUser
    public void testFindById_NonExistingId_ShouldReturn404() throws Exception {
        mockMvc.perform(get("/api/session/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testFindById_InvalidId_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/session/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testCreate_ValidSession_ShouldReturnCreatedSession() throws Exception {
        SessionDto newSession = new SessionDto();
        newSession.setName("New Session");
        newSession.setDescription("New Description");
        newSession.setDate(new Date());
        newSession.setTeacher_id(1L);

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newSession)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("New Session")))
                .andExpect(jsonPath("$.description", is("New Description")));
    }

    @Test
    @WithMockUser
    public void testCreate_InvalidSession_ShouldReturn400() throws Exception {
        SessionDto invalidSession = new SessionDto();

        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidSession)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testUpdate_ExistingId_ShouldReturnUpdatedSession() throws Exception {
        SessionDto updateSession = new SessionDto();
        updateSession.setName("Updated Name");
        updateSession.setDescription("Updated Description");
        updateSession.setDate(session.getDate());
        if (session.getTeacher() != null) {
            updateSession.setTeacher_id(session.getTeacher().getId());
        } else {
            updateSession.setTeacher_id(1L);
        }

        mockMvc.perform(put("/api/session/{id}", session.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateSession)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Name")))
                .andExpect(jsonPath("$.description", is("Updated Description")));
    }

    @Test
    @WithMockUser
    public void testUpdate_InvalidId_ShouldReturn400() throws Exception {
        SessionDto updateSession = new SessionDto();
        updateSession.setName("Updated Name");
        updateSession.setDescription("Updated Description");

        mockMvc.perform(put("/api/session/{id}", "invalid")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateSession)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testDelete_ExistingId_ShouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", session.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testDelete_NonExistingId_ShouldReturn404() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testDelete_InvalidId_ShouldReturn400() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testParticipate_ValidIds_ShouldReturn200() throws Exception {
        User newUser = new User();
        newUser.setFirstName("New");
        newUser.setLastName("User");
        newUser.setEmail("newuser@example.com");
        newUser.setPassword("password");
        newUser.setAdmin(false);
        newUser = userRepository.save(newUser);

        Session newSession = new Session();
        newSession.setName("New Session");
        newSession.setDescription("Description");
        newSession.setDate(new Date());
        newSession.setUsers(new ArrayList<>());
        newSession = sessionRepository.save(newSession);

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", newSession.getId(), newUser.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testParticipate_InvalidSessionId_ShouldReturn400() throws Exception {
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", "invalid", user.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testParticipate_InvalidUserId_ShouldReturn400() throws Exception {
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), "invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testNoLongerParticipate_ValidIds_ShouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", session.getId(), user.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    public void testNoLongerParticipate_InvalidSessionId_ShouldReturn400() throws Exception {
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", "invalid", user.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testNoLongerParticipate_InvalidUserId_ShouldReturn400() throws Exception {
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", session.getId(), "invalid"))
                .andExpect(status().isBadRequest());
    }
}
