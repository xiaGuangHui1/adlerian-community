package com.adlerian.service;

import com.adlerian.dto.ConversationDTO;
import com.adlerian.dto.MessageDTO;
import com.adlerian.dto.PostDTO;
import com.adlerian.entity.Conversation;
import com.adlerian.entity.Message;
import com.adlerian.entity.User;
import com.adlerian.repository.ConversationRepository;
import com.adlerian.repository.MessageRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public List<ConversationDTO> getConversations(UUID currentUserId) {
        return conversationRepository.findByUserId(currentUserId).stream()
                .map(c -> toConversationDTO(c, currentUserId))
                .toList();
    }

    public long getUnreadCount(UUID currentUserId) {
        return conversationRepository.findByUserId(currentUserId).stream()
                .mapToLong(c -> messageRepository.countUnread(c.getId(), currentUserId))
                .sum();
    }

    @Transactional
    public ConversationDTO getOrCreateConversation(UUID currentUserId, UUID otherUserId) {
        if (currentUserId.equals(otherUserId)) {
            throw new RuntimeException("不能和自己私信");
        }
        UUID a = currentUserId.compareTo(otherUserId) < 0 ? currentUserId : otherUserId;
        UUID b = currentUserId.compareTo(otherUserId) < 0 ? otherUserId : currentUserId;

        Conversation conversation = conversationRepository.findByUserAAndUserB(a, b)
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder().userA(a).userB(b).build()));

        return toConversationDTO(conversation, currentUserId);
    }

    public ConversationDTO getConversation(Long conversationId, UUID currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        if (!isParticipant(conversation, currentUserId)) {
            throw new RuntimeException("无权访问该会话");
        }
        return toConversationDTO(conversation, currentUserId);
    }

    public List<MessageDTO> getMessages(Long conversationId, UUID currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        if (!isParticipant(conversation, currentUserId)) {
            throw new RuntimeException("无权访问该会话");
        }
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::toMessageDTO)
                .toList();
    }

    @Transactional
    public MessageDTO sendMessage(Long conversationId, UUID senderId, String content) {
        if (content == null || content.isBlank()) {
            throw new RuntimeException("消息不能为空");
        }
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        if (!isParticipant(conversation, senderId)) {
            throw new RuntimeException("无权访问该会话");
        }

        Message message = Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .content(content.trim())
                .build();
        Message saved = messageRepository.save(message);

        conversation.setLastMessageAt(Instant.now());
        conversationRepository.save(conversation);

        return toMessageDTO(saved);
    }

    @Transactional
    public void markRead(Long conversationId, UUID userId) {
        messageRepository.markConversationRead(conversationId, userId);
    }

    private boolean isParticipant(Conversation c, UUID userId) {
        return c.getUserA().equals(userId) || c.getUserB().equals(userId);
    }

    private UUID otherUserId(Conversation c, UUID currentUserId) {
        return c.getUserA().equals(currentUserId) ? c.getUserB() : c.getUserA();
    }

    private ConversationDTO toConversationDTO(Conversation c, UUID currentUserId) {
        UUID otherId = otherUserId(c, currentUserId);
        User other = userRepository.findById(otherId).orElse(null);

        PostDTO.AuthorDTO otherUser = PostDTO.AuthorDTO.builder()
                .id(otherId)
                .nickname(other != null ? other.getNickname() : "社区成员")
                .avatarUrl(other != null ? other.getAvatarUrl() : null)
                .build();

        String lastMessage = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(c.getId())
                .map(m -> {
                    String s = m.getContent();
                    return s.length() > 30 ? s.substring(0, 30) + "..." : s;
                })
                .orElse("");

        return ConversationDTO.builder()
                .id(c.getId())
                .otherUser(otherUser)
                .lastMessage(lastMessage)
                .lastMessageAt(c.getLastMessageAt())
                .unreadCount(messageRepository.countUnread(c.getId(), currentUserId))
                .build();
    }

    private MessageDTO toMessageDTO(Message m) {
        return MessageDTO.builder()
                .id(m.getId())
                .senderId(m.getSenderId())
                .content(m.getContent())
                .read(m.isRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
