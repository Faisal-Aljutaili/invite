package com.invite.scheduler;

import com.invite.model.Invitee;
import com.invite.model.InviteeStatus;
import com.invite.repository.EventRepository;
import com.invite.repository.InviteeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventScheduler {

    private final EventRepository eventRepository;
    private final InviteeRepository inviteeRepository;

    /** Runs daily at midnight — marks past events done and unresponded invitees as NO_RESPONSE. */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markCompletedEvents() {
        List<com.invite.model.Event> pastEvents =
                eventRepository.findByIsEventDoneFalseAndDateOfTheEventBefore(LocalDate.now());

        for (com.invite.model.Event event : pastEvents) {
            event.setEventDone(true);
            eventRepository.save(event);

            List<Invitee> pending = inviteeRepository
                    .findByEventAndStatus(event, InviteeStatus.PENDING);
            for (Invitee inv : pending) {
                inv.setStatus(InviteeStatus.NO_RESPONSE);
                inviteeRepository.save(inv);
            }

            log.info("Event {} marked done, {} invitees set to NO_RESPONSE",
                    event.getId(), pending.size());
        }
    }
}
