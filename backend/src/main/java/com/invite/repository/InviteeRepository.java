package com.invite.repository;

import com.invite.model.Event;
import com.invite.model.Invitee;
import com.invite.model.InviteeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InviteeRepository extends JpaRepository<Invitee, String> {
    List<Invitee> findByEvent(Event event);
    List<Invitee> findByEventAndSentAtIsNull(Event event);
    List<Invitee> findByEventAndStatus(Event event, InviteeStatus status);
    int countByEvent(Event event);
    long countByEventAndSentAtIsNull(Event event);
}
