package com.invite.service;

import com.invite.dto.template.CreateTemplateRequest;
import com.invite.dto.template.TemplateResponse;
import com.invite.model.Template;
import com.invite.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateResponse create(CreateTemplateRequest req) {
        Template t = Template.builder().template(req.getTemplate()).build();
        return TemplateResponse.from(templateRepository.save(t));
    }

    public List<TemplateResponse> list() {
        return templateRepository.findAll().stream().map(TemplateResponse::from).toList();
    }

    public TemplateResponse get(String id) {
        return TemplateResponse.from(findById(id));
    }

    public void delete(String id) {
        templateRepository.delete(findById(id));
    }

    public Template findById(String id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + id));
    }
}
