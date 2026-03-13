package com.invite.service;

import com.invite.dto.payment.CreatePaymentRequest;
import com.invite.dto.payment.PaymentResponse;
import com.invite.model.Payment;
import com.invite.model.User;
import com.invite.repository.PaymentRepository;
import com.invite.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock PaymentRepository paymentRepository;
    @Mock UserRepository userRepository;

    @InjectMocks PaymentService paymentService;

    @Test
    void recordPayment_creditsInvites() {
        User user = User.builder().id("u1").userName("alice")
                .email("a@b.com").passwordHash("x")
                .availableNumberOfInvites(5).build();

        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setAmount(new BigDecimal("29.99"));
        req.setNumberOfInvites(50);

        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse resp = paymentService.recordPayment(user, req);

        assertThat(resp.getNumberOfInvites()).isEqualTo(50);
        assertThat(resp.getAmount()).isEqualByComparingTo("29.99");
        assertThat(user.getAvailableNumberOfInvites()).isEqualTo(55);
    }
}
