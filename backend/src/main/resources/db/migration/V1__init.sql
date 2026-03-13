CREATE TABLE users (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    user_name     VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone_number  VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    available_number_of_invites INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE templates (
    id         VARCHAR(36) NOT NULL PRIMARY KEY,
    template   TEXT        NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id                VARCHAR(36)  NOT NULL PRIMARY KEY,
    invite_by         VARCHAR(36)  NOT NULL,
    number_of_invites INT          NOT NULL,
    date_of_the_event DATE         NOT NULL,
    is_event_done     BOOLEAN      NOT NULL DEFAULT FALSE,
    used_template     VARCHAR(36),
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_user     FOREIGN KEY (invite_by)     REFERENCES users(id),
    CONSTRAINT fk_event_template FOREIGN KEY (used_template) REFERENCES templates(id)
);

CREATE TABLE invitees (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    event_id     VARCHAR(36)  NOT NULL,
    phone_number VARCHAR(20)  NOT NULL,
    status       ENUM('PENDING','ACCEPTED','DECLINED','NO_RESPONSE') NOT NULL DEFAULT 'PENDING',
    sent_at      TIMESTAMP,
    template_id  VARCHAR(36),
    CONSTRAINT fk_invitee_event    FOREIGN KEY (event_id)    REFERENCES events(id),
    CONSTRAINT fk_invitee_template FOREIGN KEY (template_id) REFERENCES templates(id)
);

CREATE TABLE payments (
    id                VARCHAR(36)    NOT NULL PRIMARY KEY,
    user_id           VARCHAR(36)    NOT NULL,
    amount            DECIMAL(10, 2) NOT NULL,
    number_of_invites INT            NOT NULL,
    payment_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE otp_tokens (
    id         VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    otp        VARCHAR(6)  NOT NULL,
    expires_at TIMESTAMP   NOT NULL,
    used       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id)
);
