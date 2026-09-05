package com.adlerian.service;

import com.adlerian.entity.Feedback;
import com.adlerian.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    @Transactional
    public void submit(UUID userId, String content, String contact) {
        if (content == null || content.isBlank()) {
            throw new RuntimeException("反馈内容不能为空");
        }
        Feedback feedback = Feedback.builder()
                .userId(userId)
                .content(content.trim())
                .contact(contact != null && !contact.isBlank() ? contact.trim() : null)
                .build();
        feedbackRepository.save(feedback);
    }
}
