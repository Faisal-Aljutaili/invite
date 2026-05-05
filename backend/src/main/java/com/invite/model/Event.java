package com.invite.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invite_by", nullable = false)
    private User inviteBy;

    @Column(name = "number_of_invites", nullable = false)
    private int numberOfInvites;

    @Column(name = "date_of_the_event", nullable = false)
    private LocalDate dateOfTheEvent;

    @Column(name = "is_event_done", nullable = false)
    @Builder.Default
    private boolean isEventDone = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "used_template")
    private Template usedTemplate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
