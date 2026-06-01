package com.adlerian.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getCategories() {
        return ResponseEntity.ok(List.of(
                Map.of("value", "parent-child-conflict", "label", "改善亲子冲突"),
                Map.of("value", "reduce-internal-friction", "label", "减少内耗"),
                Map.of("value", "enhance-connection", "label", "提升关系感"),
                Map.of("value", "life-courage", "label", "生活勇气", "icon", "💪"),
                Map.of("value", "relationships", "label", "人际关系", "icon", "🤝"),
                Map.of("value", "self-acceptance", "label", "自我接纳", "icon", "💝"),
                Map.of("value", "work-meaning", "label", "工作意义", "icon", "💼"),
                Map.of("value", "emotional-confusion", "label", "情感困惑", "icon", "💭"),
                Map.of("value", "other", "label", "其他", "icon", "💬")
        ));
    }
}
