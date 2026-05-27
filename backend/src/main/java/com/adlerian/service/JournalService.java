package com.adlerian.service;

import com.adlerian.dto.CreateJournalRequest;
import com.adlerian.dto.JournalDTO;
import com.adlerian.dto.PostDTO;
import com.adlerian.entity.Journal;
import com.adlerian.entity.User;
import com.adlerian.repository.JournalRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository journalRepository;
    private final UserRepository userRepository;

    public Page<JournalDTO> getMyJournals(UUID authorId, Pageable pageable) {
        return journalRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable).map(this::toDTO);
    }

    public Page<JournalDTO> getPublicJournals(Pageable pageable) {
        return journalRepository.findByIsPublicTrueOrderByCreatedAtDesc(pageable).map(this::toDTO);
    }

    public JournalDTO getJournalById(Long id, UUID requesterId) {
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("日记不存在"));
        if (!journal.isPublic() && !journal.getAuthor().getId().equals(requesterId)) {
            throw new RuntimeException("无权查看此日记");
        }
        return toDTO(journal);
    }

    @Transactional
    public JournalDTO createJournal(UUID authorId, CreateJournalRequest request) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Journal journal = Journal.builder()
                .author(author)
                .title(request.getTitle())
                .content(request.getContent())
                .templateType(request.getTemplateType())
                .isPublic(request.isPublic())
                .build();
        return toDTO(journalRepository.save(journal));
    }

    @Transactional
    public JournalDTO updateJournal(Long id, UUID authorId, CreateJournalRequest request) {
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("日记不存在"));
        if (!journal.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("无权修改此日记");
        }
        journal.setTitle(request.getTitle());
        journal.setContent(request.getContent());
        journal.setTemplateType(request.getTemplateType());
        journal.setPublic(request.isPublic());
        return toDTO(journalRepository.save(journal));
    }

    @Transactional
    public void deleteJournal(Long id, UUID authorId) {
        Journal journal = journalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("日记不存在"));
        if (!journal.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("无权删除此日记");
        }
        journalRepository.delete(journal);
    }

    private JournalDTO toDTO(Journal journal) {
        return JournalDTO.builder()
                .id(journal.getId())
                .title(journal.getTitle())
                .content(journal.getContent())
                .templateType(journal.getTemplateType())
                .isPublic(journal.isPublic())
                .author(PostDTO.AuthorDTO.builder()
                        .id(journal.getAuthor().getId())
                        .nickname(journal.getAuthor().getNickname())
                        .avatarUrl(journal.getAuthor().getAvatarUrl())
                        .build())
                .createdAt(journal.getCreatedAt())
                .updatedAt(journal.getUpdatedAt())
                .build();
    }
}
