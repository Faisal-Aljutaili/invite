package com.invite.controller;

import com.invite.dto.invitee.InviteeResponse;
import com.invite.dto.invitee.RespondRequest;
import com.invite.dto.event.EventResponse;
import com.invite.dto.template.TemplateResponse;
import com.invite.model.Invitee;
import com.invite.model.InviteeStatus;
import com.invite.repository.InviteeRepository;
import com.invite.service.InviteeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/public/invite")
@RequiredArgsConstructor
public class PublicInviteController {

    private final InviteeService inviteeService;
    private final InviteeRepository inviteeRepository;

    /** Returns invitee + event + template info for the invite page. */
    @GetMapping("/{inviteeId}")
    public ResponseEntity<Map<String, Object>> getInvite(@PathVariable String inviteeId) {
        Invitee invitee = inviteeRepository.findById(inviteeId)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found"));

        Map<String, Object> body = Map.of(
                "invitee", InviteeResponse.from(invitee),
                "event", EventResponse.from(invitee.getEvent()),
                "template", invitee.getTemplate() != null
                        ? TemplateResponse.from(invitee.getTemplate())
                        : null
        );
        return ResponseEntity.ok(body);
    }

    @PostMapping("/{inviteeId}/respond")
    public ResponseEntity<InviteeResponse> respond(
            @PathVariable String inviteeId,
            @Valid @RequestBody RespondRequest req) {
        return ResponseEntity.ok(inviteeService.respond(inviteeId, req.getStatus()));
    }
}
