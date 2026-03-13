package com.invite.service;

import com.invite.config.JwtUtil;
import com.invite.dto.auth.*;
import com.invite.model.OtpToken;
import com.invite.model.User;
import com.invite.repository.OtpTokenRepository;
import com.invite.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock OtpTokenRepository otpTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock EmailService emailService;

    @InjectMocks AuthService authService;

    @BeforeEach
    void setUp() {
        when(jwtUtil.generate(any(), any())).thenReturn("mock-token");
    }

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setUserName("alice");
        req.setEmail("alice@example.com");
        req.setPhoneNumber("+1234567890");
        req.setPassword("secret123");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByUserName("alice")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse resp = authService.register(req);

        assertThat(resp.getToken()).isEqualTo("mock-token");
        assertThat(resp.getUserName()).isEqualTo("alice");
    }

    @Test
    void register_duplicateEmail_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setUserName("bob");
        req.setEmail("dup@example.com");
        req.setPhoneNumber("+1");
        req.setPassword("pass");

        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already in use");
    }

    @Test
    void login_success() {
        User user = User.builder().id("u1").email("a@b.com")
                .userName("alice").passwordHash("hashed").build();

        LoginRequest req = new LoginRequest();
        req.setEmail("a@b.com");
        req.setPassword("secret");

        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hashed")).thenReturn(true);

        AuthResponse resp = authService.login(req);
        assertThat(resp.getToken()).isEqualTo("mock-token");
    }

    @Test
    void login_wrongPassword_throws() {
        User user = User.builder().id("u1").email("a@b.com")
                .userName("alice").passwordHash("hashed").build();

        LoginRequest req = new LoginRequest();
        req.setEmail("a@b.com");
        req.setPassword("wrong");

        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void verifyOtp_success() {
        User user = User.builder().id("u1").email("a@b.com").userName("alice")
                .passwordHash("x").build();
        OtpToken token = OtpToken.builder()
                .user(user).otp("123456")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false).build();

        OtpVerifyRequest req = new OtpVerifyRequest();
        req.setEmail("a@b.com");
        req.setOtp("123456");

        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(otpTokenRepository.findTopByUserAndUsedFalseOrderByCreatedAtDesc(user))
                .thenReturn(Optional.of(token));
        when(otpTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse resp = authService.verifyOtp(req);
        assertThat(resp.getToken()).isEqualTo("mock-token");
        assertThat(token.isUsed()).isTrue();
    }

    @Test
    void verifyOtp_expired_throws() {
        User user = User.builder().id("u1").email("a@b.com").userName("alice")
                .passwordHash("x").build();
        OtpToken token = OtpToken.builder()
                .user(user).otp("123456")
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .used(false).build();

        OtpVerifyRequest req = new OtpVerifyRequest();
        req.setEmail("a@b.com");
        req.setOtp("123456");

        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(user));
        when(otpTokenRepository.findTopByUserAndUsedFalseOrderByCreatedAtDesc(user))
                .thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.verifyOtp(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
    }
}
