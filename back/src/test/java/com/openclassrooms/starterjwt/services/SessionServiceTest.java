package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    @Test
    void create_shouldSaveSession() {
        Session session = new Session();
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.create(session);

        assertNotNull(result);
        verify(sessionRepository).save(session);
    }

    @Test
    void delete_shouldCallRepository() {
        sessionService.delete(1L);

        verify(sessionRepository).deleteById(1L);
    }

    @Test
    void findAll_shouldReturnSessions() {
        List<Session> sessions = List.of(new Session(), new Session());
        when(sessionRepository.findAll()).thenReturn(sessions);

        List<Session> result = sessionService.findAll();

        assertEquals(2, result.size());
    }

    @Test
    void getById_shouldReturnSession() {
        Session session = new Session();
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        Session result = sessionService.getById(1L);

        assertNotNull(result);
    }

    @Test
    void getById_shouldReturnNull_whenNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        Session result = sessionService.getById(1L);

        assertNull(result);
    }

    @Test
    void update_shouldUpdateSession() {
        Session session = new Session();
        when(sessionRepository.save(session)).thenReturn(session);

        Session result = sessionService.update(1L, session);

        assertEquals(1L, session.getId());
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_shouldAddUserToSession() {
        Session session = new Session();
        session.setId(1L);
        session.setUsers(new ArrayList<>());

        User user = new User();
        user.setId(2L);

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        sessionService.participate(1L, 2L);

        assertEquals(1, session.getUsers().size());
        verify(sessionRepository).save(session);
    }

    @Test
    void participate_shouldThrowNotFound_whenSessionNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> sessionService.participate(1L, 2L));
    }

    @Test
    void participate_shouldThrowNotFound_whenUserNotFound() {
        Session session = new Session();
        session.setUsers(new ArrayList<>());

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> sessionService.participate(1L, 2L));
    }

    @Test
    void participate_shouldThrowBadRequest_whenAlreadyParticipating() {
        User user = new User();
        user.setId(2L);

        Session session = new Session();
        session.setUsers(new ArrayList<>(List.of(user)));

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class,
                () -> sessionService.participate(1L, 2L));
    }
    @Test
    void noLongerParticipate_shouldRemoveUser() {
        User user = new User();
        user.setId(2L);

        Session session = new Session();
        session.setUsers(new ArrayList<>(List.of(user)));

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.noLongerParticipate(1L, 2L);

        assertTrue(session.getUsers().isEmpty());
        verify(sessionRepository).save(session);
    }

    @Test
    void noLongerParticipate_shouldThrowNotFound_whenSessionNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> sessionService.noLongerParticipate(1L, 2L));
    }

    @Test
    void noLongerParticipate_shouldThrowBadRequest_whenUserNotParticipating() {
        Session session = new Session();
        session.setUsers(new ArrayList<>());

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThrows(BadRequestException.class,
                () -> sessionService.noLongerParticipate(1L, 2L));
    }
}
