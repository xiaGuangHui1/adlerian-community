package com.adlerian.controller;

import com.adlerian.dto.ActivityItemDTO;
import com.adlerian.dto.HomeStatsDTO;
import com.adlerian.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/stats")
    public ResponseEntity<HomeStatsDTO> getStats() {
        return ResponseEntity.ok(homeService.getStats());
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityItemDTO>> getActivity(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(homeService.getActivity(limit));
    }
}
