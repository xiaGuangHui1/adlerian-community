package com.adlerian.controller;

import com.adlerian.dto.CreateResourceRequest;
import com.adlerian.dto.ResourceDTO;
import com.adlerian.entity.User;
import com.adlerian.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @Value("${app.admin-email:xgh20005@163.com}")
    private String adminEmail;

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
        requireAdmin();
        return ResponseEntity.ok(resourceService.createResource(request));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedIds) {
        requireAdmin();
        resourceService.reorderResources(orderedIds);
        return ResponseEntity.ok().build();
    }

    private void requireAdmin() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal instanceof User u ? u.getEmail() : null;
        if (adminEmail != null && !adminEmail.isBlank()
                && !adminEmail.equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "仅管理员可操作");
        }
    }
}
