package com.invite.dto.invitee;

import com.invite.model.InviteeStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RespondRequest {
    @NotNull
    private InviteeStatus status; // ACCEPTED or DECLINED
}
