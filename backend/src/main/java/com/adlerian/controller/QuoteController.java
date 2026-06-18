package com.adlerian.controller;

import com.adlerian.dto.QuoteDTO;
import com.adlerian.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Page<QuoteDTO>> getAllQuotes(Pageable pageable) {
        return ResponseEntity.ok(quoteService.getAllQuotes(pageable));
    }
}
