package com.invite.dto.user;

import com.invite.model.User;
import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String userName;
    private String email;
    private String phoneNumber;
    private int availableNumberOfInvites;

    public static UserResponse from(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setUserName(user.getUserName());
        r.setEmail(user.getEmail());
        r.setPhoneNumber(user.getPhoneNumber());
        r.setAvailableNumberOfInvites(user.getAvailableNumberOfInvites());
        return r;
    }
}
