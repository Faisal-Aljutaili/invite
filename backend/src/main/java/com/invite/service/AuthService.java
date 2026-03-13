package com.invite.service;

import com.invite.config.JwtUtil;
import com.invite.dto.auth.*;
import com.invite.model.OtpToken;
import com.invite.model.User;
import com.invite.repository.OtpTokenRepository;
import com.invite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already in use");
        if (userRepository.existsByUserName(req.getUserName()))
            throw new IllegalArgumentException("Username already taken");

        User user = User.builder()
                .userName(req.getUserName())
                .email(req.getEmail())
                .phoneNumber(req.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .availableNumberOfInvites(0)
                .build();

        userRepository.save(user);
        String token = jwtUtil.generate(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getUserName(), user.getEmail());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash()))
            throw new IllegalArgumentException("Invalid credentials");

        String token = jwtUtil.generate(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getUserName(), user.getEmail());
    }

    @Transactional
    public void requestOtp(OtpRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account with that email"));

        // Invalidate old OTPs
        otpTokenRepository.deleteByUser(user);

        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpToken token = OtpToken.builder()
                .user(user)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpTokenRepository.save(token);

        emailService.sendOtp(user.getEmail(), otp);
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account with that email"));

        OtpToken token = otpTokenRepository
                .findTopByUserAndUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new IllegalArgumentException("No active OTP found"));

        if (!token.getOtp().equals(req.getOtp()))
            throw new IllegalArgumentException("Invalid OTP");

        if (token.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("OTP has expired");

        token.setUsed(true);
        otpTokenRepository.save(token);

        String jwt = jwtUtil.generate(user.getId(), user.getEmail());
        return new AuthResponse(jwt, user.getId(), user.getUserName(), user.getEmail());
    }
}
