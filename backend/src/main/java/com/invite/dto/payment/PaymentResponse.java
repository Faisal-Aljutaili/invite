package com.invite.dto.payment;

import com.invite.model.Payment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private String id;
    private String userId;
    private BigDecimal amount;
    private int numberOfInvites;
    private LocalDateTime paymentAt;

    public static PaymentResponse from(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.setId(p.getId());
        r.setUserId(p.getUser().getId());
        r.setAmount(p.getAmount());
        r.setNumberOfInvites(p.getNumberOfInvites());
        r.setPaymentAt(p.getPaymentAt());
        return r;
    }
}
