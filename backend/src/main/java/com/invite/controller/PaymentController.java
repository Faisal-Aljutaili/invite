package com.invite.controller;

import com.invite.dto.payment.CreatePaymentRequest;
import com.invite.dto.payment.PaymentResponse;
import com.invite.model.User;
import com.invite.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> record(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreatePaymentRequest req) {
        return ResponseEntity.ok(paymentService.recordPayment(user, req));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.list(user));
    }
}
