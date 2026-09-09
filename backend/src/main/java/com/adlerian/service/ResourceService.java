package com.adlerian.service;

import com.adlerian.dto.CreateResourceRequest;
import com.adlerian.dto.ResourceDTO;
import com.adlerian.entity.Resource;
import com.adlerian.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public Page<ResourceDTO> getResourcesByType(String type, Pageable pageable) {
        return resourceRepository.findByTypeOrderBySortOrderAsc(type, pageable).map(this::toDTO);
    }

    @Transactional
    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资源不存在"));
        resource.setViewCount(resource.getViewCount() + 1);
        resourceRepository.save(resource);
        return toDTO(resource);
    }

    /** 精选：按手动排序（sortOrder 升序） */
    public List<ResourceDTO> getCuratedResources() {
        return resourceRepository.findAllByOrderBySortOrderAscIdAsc()
                .stream().map(this::toDTO).toList();
    }

    /** 最新：按创建时间倒序 */
    public List<ResourceDTO> getLatestResources(int limit) {
        return resourceRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, Math.min(limit, 100)))
                .getContent().stream().map(this::toDTO).toList();
    }

    /** 最热：按阅读量倒序，其次按创建时间倒序 */
    public List<ResourceDTO> getHotResources(int limit) {
        return resourceRepository.findAllByOrderByViewCountDescCreatedAtDesc(PageRequest.of(0, Math.min(limit, 100)))
                .getContent().stream().map(this::toDTO).toList();
    }

    @Transactional
    public ResourceDTO createResource(CreateResourceRequest request) {
        int maxSort = resourceRepository.findAll().stream()
                .mapToInt(Resource::getSortOrder).max().orElse(0);
        Resource resource = Resource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .content(request.getContent())
                .sortOrder(maxSort + 1)
                .build();
        return toDTO(resourceRepository.save(resource));
    }

    @Transactional
    public void reorderResources(List<Long> orderedIds) {
        Map<Long, Resource> byId = resourceRepository.findAllById(orderedIds).stream()
                .collect(Collectors.toMap(Resource::getId, r -> r));
        for (int i = 0; i < orderedIds.size(); i++) {
            Resource r = byId.get(orderedIds.get(i));
            if (r != null) {
                r.setSortOrder(i + 1);
            }
        }
        resourceRepository.saveAll(byId.values());
    }

    private ResourceDTO toDTO(Resource r) {
        return ResourceDTO.builder()
                .id(r.getId())
                .title(r.getTitle())
                .description(r.getDescription())
                .type(r.getType())
                .content(r.getContent())
                .coverUrl(r.getCoverUrl())
                .viewCount(r.getViewCount())
                .sortOrder(r.getSortOrder())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
