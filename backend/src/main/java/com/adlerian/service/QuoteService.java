package com.adlerian.service;

import com.adlerian.dto.QuoteDTO;
import com.adlerian.entity.Quote;
import com.adlerian.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteRepository quoteRepository;

    public QuoteDTO getDailyQuote() {
        Quote quote = quoteRepository.findRandom()
                .orElseThrow(() -> new RuntimeException("暂无引述"));
        return toDTO(quote);
    }

    public Page<QuoteDTO> getAllQuotes(Pageable pageable) {
        return quoteRepository.findAll(pageable).map(this::toDTO);
    }

    private QuoteDTO toDTO(Quote q) {
        return QuoteDTO.builder()
                .id(q.getId())
                .content(q.getContent())
                .author(q.getAuthor())
                .source(q.getSource())
                .createdAt(q.getCreatedAt())
                .build();
    }
}
