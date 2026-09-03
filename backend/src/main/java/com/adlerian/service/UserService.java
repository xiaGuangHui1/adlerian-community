package com.adlerian.service;

import com.adlerian.dto.UpdateUserRequest;
import com.adlerian.entity.User;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<User> findByAuthId(UUID authId) {
        return userRepository.findByAuthId(authId);
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User createUser(UUID authId, String nickname, String avatarUrl) {
        User user = User.builder()
                .authId(authId)
                .nickname(nickname)
                .avatarUrl(avatarUrl)
                .build();
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        if (request.getNickname() != null) user.setNickname(request.getNickname());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getBio() != null) user.setBio(request.getBio());
        return userRepository.save(user);
    }
}
