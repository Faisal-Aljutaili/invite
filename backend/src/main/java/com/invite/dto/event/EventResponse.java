package com.invite.dto.event;

import com.invite.model.Event;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EventResponse {
    private String id;
    private String inviteById;
    private String inviteByName;
    private int numberOfInvites;
    private LocalDate dateOfTheEvent;
    private boolean isEventDone;
    private String usedTemplateId;
    private LocalDateTime createdAt;

    public static EventResponse from(Event e) {
        EventResponse r = new EventResponse();
        r.setId(e.getId());
        r.setInviteById(e.getInviteBy().getId());
        r.setInviteByName(e.getInviteBy().getUserName());
        r.setNumberOfInvites(e.getNumberOfInvites());
        r.setDateOfTheEvent(e.getDateOfTheEvent());
        r.setEventDone(e.isEventDone());
        r.setUsedTemplateId(e.getUsedTemplate() != null ? e.getUsedTemplate().getId() : null);
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }
}
