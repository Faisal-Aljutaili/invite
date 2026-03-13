package com.invite.service;

import com.invite.dto.event.CreateEventRequest;
import com.invite.dto.event.EventResponse;
import com.invite.model.Event;
import com.invite.model.User;
import com.invite.repository.EventRepository;
import com.invite.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock EventRepository eventRepository;
    @Mock UserRepository userRepository;
    @Mock TemplateService templateService;

    @InjectMocks EventService eventService;

    @Test
    void create_success_deductsInvites() {
        User user = User.builder().id("u1").userName("alice")
                .email("a@b.com").passwordHash("x")
                .availableNumberOfInvites(10).build();

        CreateEventRequest req = new CreateEventRequest();
        req.setDateOfTheEvent(LocalDate.now().plusDays(7));
        req.setNumberOfInvites(5);

        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        EventResponse resp = eventService.create(user, req);

        assertThat(resp.getNumberOfInvites()).isEqualTo(5);
        assertThat(user.getAvailableNumberOfInvites()).isEqualTo(5);
    }

    @Test
    void create_notEnoughInvites_throws() {
        User user = User.builder().id("u1").userName("alice")
                .email("a@b.com").passwordHash("x")
                .availableNumberOfInvites(2).build();

        CreateEventRequest req = new CreateEventRequest();
        req.setDateOfTheEvent(LocalDate.now().plusDays(7));
        req.setNumberOfInvites(5);

        assertThatThrownBy(() -> eventService.create(user, req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Not enough invites");
    }

    @Test
    void delete_wrongUser_throws() {
        User owner = User.builder().id("u1").userName("alice")
                .email("a@b.com").passwordHash("x").availableNumberOfInvites(0).build();
        User other = User.builder().id("u2").userName("bob")
                .email("b@b.com").passwordHash("x").availableNumberOfInvites(0).build();

        Event event = Event.builder().id("e1").inviteBy(owner)
                .numberOfInvites(3).dateOfTheEvent(LocalDate.now().plusDays(1)).build();

        when(eventRepository.findById("e1")).thenReturn(java.util.Optional.of(event));

        assertThatThrownBy(() -> eventService.delete(other, "e1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Access denied");
    }
}
