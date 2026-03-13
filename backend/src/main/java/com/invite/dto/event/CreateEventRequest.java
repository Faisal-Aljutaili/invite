package com.invite.dto.event;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateEventRequest {
    @NotNull
    @Future
    private LocalDate dateOfTheEvent;

    @Min(1)
    private int numberOfInvites;

    private String templateId;
}
