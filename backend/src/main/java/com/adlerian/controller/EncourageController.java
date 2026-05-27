package com.adlerian.controller;

import com.adlerian.dto.CreateEncouragementRequest;
import com.adlerian.dto.EncouragementDTO;
import com.adlerian.entity.User;
import com.adlerian.service.EncourageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encouragements")
@RequiredArgsConstructor
public class EncourageController {

    private final EncourageService encourageService;

    @GetMapping
    public ResponseEntity<List<EncouragementDTO>> getEncouragements(
            @RequestParam String targetType,
            @RequestParam Long targetId) {
        return ResponseEntity.ok(encourageService.getEncouragements(targetType, targetId));
    }

    @PostMapping
    public ResponseEntity<EncouragementDTO> sendEncouragement(
            @RequestParam String targetType,
            @RequestParam Long targetId,
            @Valid @RequestBody CreateEncouragementRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(encourageService.createEncouragement(
                user.getId(), targetType, targetId, request));
    }

    @GetMapping("/received")
    public ResponseEntity<List<EncouragementDTO>> getReceivedEncouragements() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(encourageService.getUserEncouragements(user.getId()));
    }
}
