package com.adlerian.controller;

import com.adlerian.dto.TeamDTO;
import com.adlerian.entity.User;
import com.adlerian.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<Map<String, String>> createInvitation() {
        User user = currentUser();
        return ResponseEntity.ok(teamService.createInvitation(user.getId()));
    }

    @GetMapping("/invitation/{code}")
    public ResponseEntity<Map<String, Object>> getInvitationDetail(@PathVariable String code) {
        return ResponseEntity.ok(teamService.getInvitationDetail(code));
    }

    @PostMapping("/{code}/join")
    public ResponseEntity<TeamDTO> joinTeam(@PathVariable String code) {
        User user = currentUser();
        return ResponseEntity.ok(teamService.joinTeam(code, user.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<TeamDTO> getMyTeam() {
        User user = currentUser();
        TeamDTO team = teamService.getMyTeam(user.getId());
        if (team == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(team);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeam(@PathVariable Long id) {
        User user = currentUser();
        return ResponseEntity.ok(teamService.getTeamDetail(id, user.getId()));
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
