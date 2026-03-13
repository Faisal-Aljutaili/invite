package com.invite.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WhatsAppService {

    /**
     * Mock implementation — replace with Twilio / Meta Business API when ready.
     */
    public void sendInvite(String phoneNumber, String message) {
        log.info("[WHATSAPP MOCK] To: {} | Message: {}", phoneNumber, message);
    }
}
