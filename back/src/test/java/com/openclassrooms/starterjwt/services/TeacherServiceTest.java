package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    @Test
    void findAll_shouldReturnTeachers() {
        List<Teacher> teachers = List.of(new Teacher(), new Teacher());
        when(teacherRepository.findAll()).thenReturn(teachers);

        List<Teacher> result = teacherService.findAll();

        assertEquals(2, result.size());
        verify(teacherRepository).findAll();
    }

    @Test
    void findById_shouldReturnTeacher_whenFound() {
        Teacher teacher = new Teacher();
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        Teacher result = teacherService.findById(1L);

        assertNotNull(result);
        verify(teacherRepository).findById(1L);
    }

    @Test
    void findById_shouldReturnNull_whenNotFound() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.empty());

        Teacher result = teacherService.findById(1L);

        assertNull(result);
        verify(teacherRepository).findById(1L);
    }
}
