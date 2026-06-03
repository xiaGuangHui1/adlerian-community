package com.adlerian.controller;

import com.adlerian.dto.CheckInDTO;
import com.adlerian.dto.CreateCheckInRequest;
import com.adlerian.entity.User;
import com.adlerian.service.DailyCheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckInController {

    private final DailyCheckInService checkInService;

    @GetMapping("/today")
    public ResponseEntity<CheckInDTO> getTodayCheckIn() {
        User user = currentUser();
        return checkInService.getTodayCheckIn(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<CheckInDTO>> getMonthlyCheckIns(
            @RequestParam int year, @RequestParam int month) {
        User user = currentUser();
        return ResponseEntity.ok(checkInService.getMonthlyCheckIns(user.getId(), year, month));
    }

    @PostMapping
    public ResponseEntity<CheckInDTO> checkIn(@Valid @RequestBody CreateCheckInRequest request) {
        User user = currentUser();
        return ResponseEntity.ok(checkInService.createOrUpdateTodayCheckIn(user.getId(), request));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        User user = currentUser();
        long totalDays = checkInService.getTotalCheckInDays(user.getId());
        int streak = checkInService.getCurrentStreak(user.getId());
        return ResponseEntity.ok(Map.of("totalDays", totalDays, "streak", streak));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CheckInDTO>> getUserCheckIns(@PathVariable UUID userId) {
        return ResponseEntity.ok(checkInService.getUserCheckIns(userId));
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable UUID userId) {
        return ResponseEntity.ok(checkInService.getUserStats(userId));
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
