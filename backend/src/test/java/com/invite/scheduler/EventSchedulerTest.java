package com.invite.scheduler;

import com.invite.model.Event;
import com.invite.model.Invitee;
import com.invite.model.InviteeStatus;
import com.invite.model.User;
import com.invite.repository.EventRepository;
import com.invite.repository.InviteeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventSchedulerTest {

    @Mock EventRepository eventRepository;
    @Mock InviteeRepository inviteeRepository;

    @InjectMocks EventScheduler scheduler;

    @Test
    void markCompletedEvents_setsEventDoneAndInviteesNoResponse() {
        User user = User.builder().id("u1").userName("alice")
                .email("a@b.com").passwordHash("x").availableNumberOfInvites(0).build();
        Event event = Event.builder().id("e1").inviteBy(user)
                .numberOfInvites(2).dateOfTheEvent(LocalDate.now().minusDays(1))
                .isEventDone(false).build();

        Invitee inv1 = Invitee.builder().id("i1").event(event)
                .phoneNumber("+1").status(InviteeStatus.PENDING).build();
        Invitee inv2 = Invitee.builder().id("i2").event(event)
                .phoneNumber("+2").status(InviteeStatus.ACCEPTED).build();

        when(eventRepository.findByIsEventDoneFalseAndDateOfTheEventBefore(any()))
                .thenReturn(List.of(event));
        when(eventRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(inviteeRepository.findByEventAndStatus(event, InviteeStatus.PENDING))
                .thenReturn(List.of(inv1));
        when(inviteeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        scheduler.markCompletedEvents();

        assertThat(event.isEventDone()).isTrue();
        assertThat(inv1.getStatus()).isEqualTo(InviteeStatus.NO_RESPONSE);
        assertThat(inv2.getStatus()).isEqualTo(InviteeStatus.ACCEPTED); // unchanged
    }
}
