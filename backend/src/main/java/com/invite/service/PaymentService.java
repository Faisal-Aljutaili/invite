package com.invite.service;

import com.invite.dto.payment.CreatePaymentRequest;
import com.invite.dto.payment.PaymentResponse;
import com.invite.model.Payment;
import com.invite.model.User;
import com.invite.repository.PaymentRepository;
import com.invite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Transactional
    public PaymentResponse recordPayment(User user, CreatePaymentRequest req) {
        Payment payment = Payment.builder()
                .user(user)
                .amount(req.getAmount())
                .numberOfInvites(req.getNumberOfInvites())
                .build();
        paymentRepository.save(payment);

        // Credit invites to the user
        user.setAvailableNumberOfInvites(
                user.getAvailableNumberOfInvites() + req.getNumberOfInvites());
        userRepository.save(user);

        return PaymentResponse.from(payment);
    }

    public List<PaymentResponse> list(User user) {
        return paymentRepository.findByUserOrderByPaymentAtDesc(user)
                .stream().map(PaymentResponse::from).toList();
    }
}
