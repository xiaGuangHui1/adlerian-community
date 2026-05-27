package com.adlerian.controller;

import com.adlerian.dto.CreateJournalRequest;
import com.adlerian.dto.JournalDTO;
import com.adlerian.entity.User;
import com.adlerian.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/journals")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @GetMapping("/mine")
    public ResponseEntity<Page<JournalDTO>> getMyJournals(Pageable pageable) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(journalService.getMyJournals(user.getId(), pageable));
    }

    @GetMapping("/public")
    public ResponseEntity<Page<JournalDTO>> getPublicJournals(Pageable pageable) {
        return ResponseEntity.ok(journalService.getPublicJournals(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalDTO> getJournal(@PathVariable Long id) {
        User user = null;
        try {
            user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        } catch (Exception ignored) {}
        return ResponseEntity.ok(journalService.getJournalById(id,
                user != null ? user.getId() : null));
    }

    @PostMapping
    public ResponseEntity<JournalDTO> createJournal(@Valid @RequestBody CreateJournalRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(journalService.createJournal(user.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JournalDTO> updateJournal(@PathVariable Long id,
                                                     @Valid @RequestBody CreateJournalRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(journalService.updateJournal(id, user.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJournal(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        journalService.deleteJournal(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
