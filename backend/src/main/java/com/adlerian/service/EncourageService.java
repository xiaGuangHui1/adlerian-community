package com.adlerian.service;

import com.adlerian.dto.CreateEncouragementRequest;
import com.adlerian.dto.EncouragementDTO;
import com.adlerian.dto.PostDTO;
import com.adlerian.entity.Comment;
import com.adlerian.entity.DailyCheckIn;
import com.adlerian.entity.Encouragement;
import com.adlerian.entity.Post;
import com.adlerian.entity.User;
import com.adlerian.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EncourageService {

    private final EncourageRepository encourageRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final DailyCheckInRepository checkInRepository;

    public List<EncouragementDTO> getEncouragements(String targetType, Long targetId) {
        return encourageRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(targetType, targetId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public EncouragementDTO createEncouragement(UUID senderId, String targetType, Long targetId,
                                                 CreateEncouragementRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 根据目标类型找到接收者
        User receiver;
        if ("post".equals(targetType)) {
            Post post = postRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("帖子不存在"));
            receiver = post.getAuthor();
        } else if ("comment".equals(targetType)) {
            Comment comment = commentRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("评论不存在"));
            receiver = comment.getAuthor();
        } else if ("checkin".equals(targetType)) {
            DailyCheckIn checkIn = checkInRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("打卡不存在"));
            receiver = checkIn.getUser();
        } else {
            receiver = userRepository.findById(UUID.fromString(targetId.toString()))
                    .orElseThrow(() -> new RuntimeException("用户不存在"));
        }

        Encouragement encouragement = Encouragement.builder()
                .sender(sender)
                .receiver(receiver)
                .targetType(targetType)
                .targetId(targetId)
                .message(request.getMessage())
                .anonymous(request.isAnonymous())
                .build();

        return toDTO(encourageRepository.save(encouragement));
    }

    public List<EncouragementDTO> getUserEncouragements(UUID userId) {
        return encourageRepository.findByReceiverIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).toList();
    }

    private EncouragementDTO toDTO(Encouragement e) {
        PostDTO.AuthorDTO senderDTO = null;
        if (!e.isAnonymous()) {
            senderDTO = PostDTO.AuthorDTO.builder()
                    .id(e.getSender().getId())
                    .nickname(e.getSender().getNickname())
                    .avatarUrl(e.getSender().getAvatarUrl())
                    .build();
        }
        return EncouragementDTO.builder()
                .id(e.getId())
                .sender(senderDTO)
                .message(e.getMessage())
                .anonymous(e.isAnonymous())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
