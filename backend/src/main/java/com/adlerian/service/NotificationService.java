package com.adlerian.service;

import com.adlerian.dto.NotificationDTO;
import com.adlerian.entity.Notification;
import com.adlerian.entity.User;
import com.adlerian.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Page<NotificationDTO> getNotifications(UUID recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable)
                .map(this::toDTO);
    }

    public long getUnreadCount(UUID recipientId) {
        return notificationRepository.countUnread(recipientId);
    }

    @Transactional
    public NotificationDTO markAsRead(Long id, UUID recipientId) {
        Notification n = notificationRepository.findByIdAndRecipientId(id, recipientId)
                .orElseThrow(() -> new RuntimeException("通知不存在"));
        n.setRead(true);
        return toDTO(notificationRepository.save(n));
    }

    @Transactional
    public void markAllAsRead(UUID recipientId) {
        notificationRepository.markAllRead(recipientId);
    }

    /** 创建一条通知（不通知自己）。由调用方的事务包裹。 */
    public void notify(UUID recipientId, String type, User actor,
                       String targetType, Long targetId, String content) {
        if (recipientId == null || (actor != null && recipientId.equals(actor.getId()))) {
            return;
        }
        Notification n = Notification.builder()
                .recipientId(recipientId)
                .type(type)
                .actorId(actor != null ? actor.getId() : null)
                .actorNickname(actor != null ? actor.getNickname() : null)
                .actorAvatarUrl(actor != null ? actor.getAvatarUrl() : null)
                .targetType(targetType)
                .targetId(targetId)
                .content(content)
                .build();
        notificationRepository.save(n);
    }

    /** 创建系统通知（无触发者） */
    public void notifySystem(UUID recipientId, String type, String content) {
        notify(recipientId, type, null, null, null, content);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .actorNickname(n.getActorNickname())
                .actorAvatarUrl(n.getActorAvatarUrl())
                .targetType(n.getTargetType())
                .targetId(n.getTargetId())
                .content(n.getContent())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
