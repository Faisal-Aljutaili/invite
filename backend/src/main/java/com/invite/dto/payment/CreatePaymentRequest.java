package com.invite.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentRequest {
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @Min(1)
    private int numberOfInvites;
}
