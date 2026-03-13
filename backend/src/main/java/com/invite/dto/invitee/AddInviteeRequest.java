package com.invite.dto.invitee;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddInviteeRequest {
    @NotBlank
    private String phoneNumber;
}
