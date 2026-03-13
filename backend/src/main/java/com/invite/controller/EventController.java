package com.invite.controller;

import com.invite.dto.event.CreateEventRequest;
import com.invite.dto.event.EventResponse;
import com.invite.dto.invitee.AddInviteeRequest;
import com.invite.dto.invitee.InviteeResponse;
import com.invite.model.User;
import com.invite.service.EventService;
import com.invite.service.InviteeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final InviteeService inviteeService;

    @PostMapping
    public ResponseEntity<EventResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateEventRequest req) {
        return ResponseEntity.ok(eventService.create(user, req));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventService.list(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> get(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        return ResponseEntity.ok(eventService.get(user, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        eventService.delete(user, id);
        return ResponseEntity.noContent().build();
    }

    // --- Invitees sub-resource ---

    @PostMapping("/{eventId}/invitees")
    public ResponseEntity<InviteeResponse> addInvitee(
            @AuthenticationPrincipal User user,
            @PathVariable String eventId,
            @Valid @RequestBody AddInviteeRequest req) {
        return ResponseEntity.ok(inviteeService.add(user, eventId, req));
    }

    @GetMapping("/{eventId}/invitees")
    public ResponseEntity<List<InviteeResponse>> listInvitees(
            @AuthenticationPrincipal User user,
            @PathVariable String eventId) {
        return ResponseEntity.ok(inviteeService.list(user, eventId));
    }

    @PostMapping("/{eventId}/invitees/send")
    public ResponseEntity<Map<String, String>> sendInvites(
            @AuthenticationPrincipal User user,
            @PathVariable String eventId) {
        inviteeService.sendInvites(user, eventId);
        return ResponseEntity.ok(Map.of("message", "Invites sent"));
    }
}
