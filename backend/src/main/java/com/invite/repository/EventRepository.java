package com.invite.repository;

import com.invite.model.Event;
import com.invite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findByInviteByOrderByCreatedAtDesc(User user);
    List<Event> findByIsEventDoneFalseAndDateOfTheEventBefore(LocalDate date);
}
