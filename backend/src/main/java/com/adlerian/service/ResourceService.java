package com.adlerian.service;

import com.adlerian.dto.ResourceDTO;
import com.adlerian.entity.Resource;
import com.adlerian.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public Page<ResourceDTO> getResourcesByType(String type, Pageable pageable) {
        return resourceRepository.findByTypeOrderBySortOrderAsc(type, pageable).map(this::toDTO);
    }

    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资源不存在"));
        return toDTO(resource);
    }

    public List<ResourceDTO> getHotResources(int limit) {
        return resourceRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, Math.min(limit, 100)))
                .getContent().stream().map(this::toDTO).toList();
    }

    private ResourceDTO toDTO(Resource r) {
        return ResourceDTO.builder()
                .id(r.getId())
                .title(r.getTitle())
                .description(r.getDescription())
                .type(r.getType())
                .content(r.getContent())
                .coverUrl(r.getCoverUrl())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
