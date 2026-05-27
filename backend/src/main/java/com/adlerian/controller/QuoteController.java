package com.adlerian.controller;

import com.adlerian.dto.QuoteDTO;
import com.adlerian.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    @GetMapping("/daily")
    public ResponseEntity<QuoteDTO> getDailyQuote() {
        return ResponseEntity.ok(quoteService.getDailyQuote());
    }

    @GetMapping
    public ResponseEntity<List<QuoteDTO>> getAllQuotes() {
        return ResponseEntity.ok(quoteService.getAllQuotes());
    }
}
