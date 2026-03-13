package com.invite.dto.template;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTemplateRequest {
    @NotBlank
    private String template;
}
