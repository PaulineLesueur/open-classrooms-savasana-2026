package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserDetailsImplTest {

    @Test
    void testGettersAndEquals() {
        UserDetailsImpl user1 = UserDetailsImpl.builder()
                .id(1L)
                .username("user1")
                .firstName("First")
                .lastName("User")
                .admin(true)
                .password("secret")
                .build();

        UserDetailsImpl user2 = UserDetailsImpl.builder()
                .id(1L)
                .username("user2")
                .firstName("Another")
                .lastName("Person")
                .admin(false)
                .password("anotherSecret")
                .build();

        UserDetailsImpl user3 = UserDetailsImpl.builder()
                .id(2L)
                .username("user3")
                .firstName("Third")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();

        assertTrue(user1.getAdmin());
        assertFalse(user2.getAdmin() == user1.getAdmin());

        assertEquals(user1, user2);

        assertNotEquals(user1, user3);

        assertNotEquals(user1, null);
        assertNotEquals(user1, new Object());

        assertEquals(user1, user1);
    }


}
