package com.invite.dto.invitee;

import com.invite.model.Invitee;
import com.invite.model.InviteeStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InviteeResponse {
    private String id;
    private String eventId;
    private String phoneNumber;
    private InviteeStatus status;
    private LocalDateTime sentAt;
    private String templateId;

    public static InviteeResponse from(Invitee i) {
        InviteeResponse r = new InviteeResponse();
        r.setId(i.getId());
        r.setEventId(i.getEvent().getId());
        r.setPhoneNumber(i.getPhoneNumber());
        r.setStatus(i.getStatus());
        r.setSentAt(i.getSentAt());
        r.setTemplateId(i.getTemplate() != null ? i.getTemplate().getId() : null);
        return r;
    }
}
