package com.invite.controller;

import com.invite.dto.template.CreateTemplateRequest;
import com.invite.dto.template.TemplateResponse;
import com.invite.service.TemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @PostMapping
    public ResponseEntity<TemplateResponse> create(@Valid @RequestBody CreateTemplateRequest req) {
        return ResponseEntity.ok(templateService.create(req));
    }

    @GetMapping
    public ResponseEntity<List<TemplateResponse>> list() {
        return ResponseEntity.ok(templateService.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemplateResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(templateService.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
