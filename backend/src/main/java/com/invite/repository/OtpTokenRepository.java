package com.invite.repository;

import com.invite.model.OtpToken;
import com.invite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {
    Optional<OtpToken> findTopByUserAndUsedFalseOrderByCreatedAtDesc(User user);
    void deleteByUser(User user);
}
