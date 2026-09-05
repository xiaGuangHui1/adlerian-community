package com.adlerian.controller;

import com.adlerian.dto.CreateTeamRequest;
import com.adlerian.dto.TeamDTO;
import com.adlerian.dto.TeamSummaryDTO;
import com.adlerian.entity.User;
import com.adlerian.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<Map<String, String>> createInvitation(
            @RequestBody(required = false) CreateTeamRequest request) {
        User user = currentUser();
        return ResponseEntity.ok(teamService.createInvitation(
                user.getId(), request != null ? request.getName() : null));
    }

    @GetMapping("/invitation/{code}")
    public ResponseEntity<Map<String, Object>> getInvitationDetail(@PathVariable String code) {
        return ResponseEntity.ok(teamService.getInvitationDetail(code));
    }

    @GetMapping("/open")
    public ResponseEntity<List<TeamSummaryDTO>> getOpenTeams() {
        return ResponseEntity.ok(teamService.getOpenTeams());
    }

    @PostMapping("/join-by-code")
    public ResponseEntity<TeamDTO> joinTeam(@RequestBody Map<String, String> body) {
        User user = currentUser();
        return ResponseEntity.ok(teamService.joinTeam(body.get("code"), user.getId()));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<TeamDTO> joinTeamById(@PathVariable Long id) {
        User user = currentUser();
        return ResponseEntity.ok(teamService.joinTeamById(id, user.getId()));
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
