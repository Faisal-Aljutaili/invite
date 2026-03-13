package com.invite.dto.template;

import com.invite.model.Template;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TemplateResponse {
    private String id;
    private String template;
    private LocalDateTime createdAt;

    public static TemplateResponse from(Template t) {
        TemplateResponse r = new TemplateResponse();
        r.setId(t.getId());
        r.setTemplate(t.getTemplate());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }
}
