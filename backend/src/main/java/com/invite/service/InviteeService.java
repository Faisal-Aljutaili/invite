package com.invite.service;

import com.invite.dto.invitee.AddInviteeRequest;
import com.invite.dto.invitee.InviteeResponse;
import com.invite.model.*;
import com.invite.repository.InviteeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InviteeService {

    private final InviteeRepository inviteeRepository;
    private final EventService eventService;
    private final WhatsAppService whatsAppService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public InviteeResponse add(User user, String eventId, AddInviteeRequest req) {
        Event event = eventService.findOwned(user, eventId);

        int current = inviteeRepository.countByEvent(event);
        if (current >= event.getNumberOfInvites())
            throw new IllegalStateException("Event invite capacity reached");

        Invitee invitee = Invitee.builder()
                .event(event)
                .phoneNumber(req.getPhoneNumber())
                .template(event.getUsedTemplate())
                .build();
        return InviteeResponse.from(inviteeRepository.save(invitee));
    }

    public List<InviteeResponse> list(User user, String eventId) {
        Event event = eventService.findOwned(user, eventId);
        return inviteeRepository.findByEvent(event)
                .stream().map(InviteeResponse::from).toList();
    }

    @Transactional
    public void sendInvites(User user, String eventId) {
        Event event = eventService.findOwned(user, eventId);
        Template template = event.getUsedTemplate();

        List<Invitee> unsent = inviteeRepository.findByEventAndSentAtIsNull(event);
        for (Invitee invitee : unsent) {
            String inviteLink = frontendUrl + "/invite/" + invitee.getId();
            String message = buildMessage(template, inviteLink, event);
            whatsAppService.sendInvite(invitee.getPhoneNumber(), message);
            invitee.setSentAt(LocalDateTime.now());
            inviteeRepository.save(invitee);
        }
    }

    /** Invitee responds via public link — no auth required. */
    @Transactional
    public InviteeResponse respond(String inviteeId, InviteeStatus status) {
        if (status != InviteeStatus.ACCEPTED && status != InviteeStatus.DECLINED)
            throw new IllegalArgumentException("Status must be ACCEPTED or DECLINED");

        Invitee invitee = inviteeRepository.findById(inviteeId)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found"));

        if (invitee.getStatus() != InviteeStatus.PENDING)
            throw new IllegalStateException("Already responded");

        invitee.setStatus(status);
        return InviteeResponse.from(inviteeRepository.save(invitee));
    }

    public InviteeResponse getPublic(String inviteeId) {
        Invitee invitee = inviteeRepository.findById(inviteeId)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found"));
        return InviteeResponse.from(invitee);
    }

    private String buildMessage(Template template, String inviteLink, Event event) {
        String body = template != null
                ? template.getTemplate()
                : "You are invited to our event on " + event.getDateOfTheEvent();
        return body + "\n\nRespond here: " + inviteLink;
    }
}
