package com.adlerian.controller;

import com.adlerian.dto.CreateResourceRequest;
import com.adlerian.dto.ResourceDTO;
import com.adlerian.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<?> getResources(@RequestParam(required = false) String type, Pageable pageable) {
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(resourceService.getResourcesByType(type, pageable));
        }
        return ResponseEntity.ok(resourceService.getCuratedResources());
    }

    @GetMapping("/latest")
    public ResponseEntity<List<ResourceDTO>> getLatestResources(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(resourceService.getLatestResources(limit));
    }

    @GetMapping("/hot")
    public ResponseEntity<List<ResourceDTO>> getHotResources(@RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(resourceService.getHotResources(limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResource(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody CreateResourceRequest request) {
        return ResponseEntity.ok(resourceService.createResource(request));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedIds) {
        resourceService.reorderResources(orderedIds);
        return ResponseEntity.ok().build();
    }
}
