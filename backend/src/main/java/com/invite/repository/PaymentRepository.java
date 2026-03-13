package com.invite.repository;

import com.invite.model.Payment;
import com.invite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByUserOrderByPaymentAtDesc(User user);
}
