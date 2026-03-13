package com.invite.service;

import com.invite.dto.event.CreateEventRequest;
import com.invite.dto.event.EventResponse;
import com.invite.model.Event;
import com.invite.model.Template;
import com.invite.model.User;
import com.invite.repository.EventRepository;
import com.invite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TemplateService templateService;

    @Transactional
    public EventResponse create(User user, CreateEventRequest req) {
        if (user.getAvailableNumberOfInvites() < req.getNumberOfInvites())
            throw new IllegalStateException("Not enough invites. Available: "
                    + user.getAvailableNumberOfInvites());

        Template template = null;
        if (req.getTemplateId() != null)
            template = templateService.findById(req.getTemplateId());

        Event event = Event.builder()
                .inviteBy(user)
                .numberOfInvites(req.getNumberOfInvites())
                .dateOfTheEvent(req.getDateOfTheEvent())
                .usedTemplate(template)
                .build();
        eventRepository.save(event);

        // Deduct invites
        user.setAvailableNumberOfInvites(
                user.getAvailableNumberOfInvites() - req.getNumberOfInvites());
        userRepository.save(user);

        return EventResponse.from(event);
    }

    public List<EventResponse> list(User user) {
        return eventRepository.findByInviteByOrderByCreatedAtDesc(user)
                .stream().map(EventResponse::from).toList();
    }

    public EventResponse get(User user, String id) {
        Event event = findOwned(user, id);
        return EventResponse.from(event);
    }

    public void delete(User user, String id) {
        eventRepository.delete(findOwned(user, id));
    }

    public Event findOwned(User user, String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (!event.getInviteBy().getId().equals(user.getId()))
            throw new IllegalStateException("Access denied");
        return event;
    }

    public Event findById(String id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
    }
}
