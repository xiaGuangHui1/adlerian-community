package com.adlerian.controller;

import com.adlerian.dto.CreateGroupRequest;
import com.adlerian.dto.GroupDTO;
import com.adlerian.entity.User;
import com.adlerian.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<Page<GroupDTO>> getGroups(
            @RequestParam(required = false) String category,
            Pageable pageable) {
        return ResponseEntity.ok(groupService.getGroups(category, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroup(@PathVariable Long id) {
        User user = null;
        try {
            user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        } catch (Exception ignored) {}
        return ResponseEntity.ok(groupService.getGroupById(id,
                user != null ? user.getId() : null));
    }

    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(groupService.createGroup(user.getId(), request));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinGroup(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        groupService.joinGroup(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveGroup(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        groupService.leaveGroup(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
