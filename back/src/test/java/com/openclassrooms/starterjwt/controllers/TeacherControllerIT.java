package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TeacherControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SessionRepository sessionRepository; // ajoute ça

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void testFindById_ExistingTeacher_ShouldReturnTeacher() throws Exception {
        // Préparer un Teacher en base
        Teacher teacher = new Teacher()
                .setFirstName("John")
                .setLastName("Doe");
        teacher = teacherRepository.save(teacher);

        mockMvc.perform(get("/api/teacher/{id}", teacher.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName", is("John")))
                .andExpect(jsonPath("$.lastName", is("Doe")));
    }

    @Test
    @WithMockUser
    public void testFindById_NonExistingTeacher_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", 999999)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testFindById_InvalidId_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", "invalidId")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testFindAll_ShouldReturnListOfTeachers() throws Exception {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();

        Teacher t1 = new Teacher().setFirstName("Alice").setLastName("Smith");
        Teacher t2 = new Teacher().setFirstName("Bob").setLastName("Johnson");
        teacherRepository.save(t1);
        teacherRepository.save(t2);

        mockMvc.perform(get("/api/teacher")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2))) // on attend 2 résultats
                .andExpect(jsonPath("$[0].firstName").value("Alice"))
                .andExpect(jsonPath("$[1].firstName").value("Bob"));
    }
}
