package com.adlerian.service;

import com.adlerian.dto.TeamDTO;
import com.adlerian.dto.TeamDTO.RecentActivityDTO;
import com.adlerian.dto.TeamDTO.TeamMemberDTO;
import com.adlerian.entity.DailyCheckIn;
import com.adlerian.entity.Team;
import com.adlerian.entity.Team.TeamStatus;
import com.adlerian.entity.TeamMember;
import com.adlerian.entity.User;
import com.adlerian.repository.DailyCheckInRepository;
import com.adlerian.repository.TeamMemberRepository;
import com.adlerian.repository.TeamRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final DailyCheckInRepository checkInRepository;
    private final UserRepository userRepository;

    @Transactional
    public Map<String, String> createInvitation(UUID creatorId, String name) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 检查用户是否已有活跃队伍
        teamRepository.findActiveTeamByUserId(creatorId).ifPresent(t -> {
            throw new RuntimeException("你已在队伍中，请先退出当前队伍");
        });

        // 清理旧的 PENDING 邀请
        List<Team> pendingInvitations = teamRepository.findByStatusAndCreatorId(TeamStatus.PENDING, creatorId);
        for (Team old : pendingInvitations) {
            old.setStatus(TeamStatus.DISBANDED);
            teamRepository.save(old);
        }

        String inviteCode = generateInviteCode();
        String teamName = (name != null && !name.isBlank())
                ? name.trim()
                : (creator.getNickname() + "的队伍");

        Team team = Team.builder()
                .inviteCode(inviteCode)
                .creator(creator)
                .name(teamName)
                .status(TeamStatus.PENDING)
                .build();

        Team saved = teamRepository.save(team);

        return Map.of(
                "inviteCode", saved.getInviteCode(),
                "shareUrl", "/invite?team=" + saved.getInviteCode()
        );
    }

    public Map<String, Object> getInvitationDetail(String inviteCode) {
        Team team = teamRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("邀请不存在或已过期"));

        long memberCount = teamMemberRepository.countByTeamId(team.getId());

        return Map.of(
                "code", team.getInviteCode(),
                "creatorNickname", team.getCreator().getNickname(),
                "status", team.getStatus().name(),
                "memberCount", memberCount,
                "maxMembers", team.getMaxMembers()
        );
    }

    @Transactional
    public TeamDTO joinTeam(String inviteCode, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 检查用户是否已有活跃队伍
        teamRepository.findActiveTeamByUserId(userId).ifPresent(t -> {
            throw new RuntimeException("你已在队伍中，请先退出当前队伍");
        });

        Team team = teamRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("邀请不存在或已过期"));

        if (team.getStatus() == TeamStatus.DISBANDED) {
            throw new RuntimeException("该邀请已失效");
        }

        // 检查是否已在队伍中
        teamMemberRepository.findByTeamIdAndUserId(team.getId(), userId).ifPresent(m -> {
            throw new RuntimeException("你已经在该队伍中");
        });

        long currentCount = teamMemberRepository.countByTeamId(team.getId());
        if (currentCount >= team.getMaxMembers()) {
            throw new RuntimeException("队伍已满员");
        }

        // 创建者不能加入自己的队伍（创建者是自动成员）
        if (team.getCreator().getId().equals(userId)) {
            throw new RuntimeException("你不能加入自己创建的队伍");
        }

        TeamMember member = TeamMember.builder()
                .team(team)
                .user(user)
                .build();
        teamMemberRepository.save(member);

        // 第一个接受者加入时激活队伍
        if (team.getStatus() == TeamStatus.PENDING) {
            // 将创建者也加入为成员
            TeamMember creatorMember = TeamMember.builder()
                    .team(team)
                    .user(team.getCreator())
                    .build();
            teamMemberRepository.save(creatorMember);

            team.setStatus(TeamStatus.ACTIVE);
            team.setActivatedAt(Instant.now());
            teamRepository.save(team);
        }

        return buildTeamDTO(team, userId);
    }

    public TeamDTO getMyTeam(UUID userId) {
        return teamRepository.findActiveTeamByUserId(userId)
                .map(team -> buildTeamDTO(team, userId))
                .orElse(null);
    }

    public TeamDTO getTeamDetail(Long teamId, UUID userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("队伍不存在"));

        // 检查是否为成员
        boolean isMember = team.getCreator().getId().equals(userId) ||
                teamMemberRepository.findByTeamIdAndUserId(teamId, userId).isPresent();
        if (!isMember) {
            throw new RuntimeException("你不是该队伍的成员");
        }

        return buildTeamDTO(team, userId);
    }

    private TeamDTO buildTeamDTO(Team team, UUID currentUserId) {
        List<TeamMember> members = teamMemberRepository.findByTeamIdOrderByJoinedAtAsc(team.getId());
        LocalDate today = LocalDate.now();

        List<TeamMemberDTO> memberDTOs = members.stream()
                .map(m -> {
                    TeamMemberDTO dto = TeamMemberDTO.builder()
                            .userId(m.getUser().getId().toString())
                            .nickname(m.getUser().getNickname())
                            .avatarUrl(m.getUser().getAvatarUrl())
                            .isCreator(m.getUser().getId().equals(team.getCreator().getId()))
                            .isMe(m.getUser().getId().equals(currentUserId))
                            .joinedAt(m.getJoinedAt())
                            .build();

                    // 查询今日打卡状态
                    Optional<DailyCheckIn> todayCheckIn = checkInRepository
                            .findByUserIdAndCheckinDate(m.getUser().getId(), today);
                    dto.setTodayCheckedIn(todayCheckIn.isPresent());
                    todayCheckIn.ifPresent(c -> {
                        String content = c.getContent();
                        if (content.length() > 30) {
                            content = content.substring(0, 30) + "...";
                        }
                        dto.setTodayContent(content);
                    });

                    return dto;
                })
                .collect(Collectors.toList());

        boolean allCheckedIn = memberDTOs.stream().allMatch(TeamMemberDTO::isTodayCheckedIn);

        // 计算组队天数
        long togetherDays = 0;
        if (team.getActivatedAt() != null) {
            togetherDays = java.time.temporal.ChronoUnit.DAYS.between(
                team.getActivatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate(),
                today
            ) + 1;
        }

        // 计算累计打卡数
        long totalCheckIns = 0;
        for (TeamMember member : members) {
            totalCheckIns += checkInRepository.countByUserId(member.getUser().getId());
        }

        // 最近打卡动态（最近7天）
        List<UUID> memberUserIds = members.stream()
                .map(m -> m.getUser().getId())
                .collect(Collectors.toList());
        LocalDate sevenDaysAgo = today.minusDays(7);
        List<DailyCheckIn> recentCheckIns = checkInRepository
                .findByUserIdInAndCheckinDateGreaterThanEqualOrderByCreatedAtDesc(
                    memberUserIds, sevenDaysAgo);

        List<RecentActivityDTO> recentActivities = recentCheckIns.stream()
                .limit(10)
                .map(c -> {
                    long daysAgo = java.time.temporal.ChronoUnit.DAYS.between(
                        c.getCheckinDate(), today);
                    String relativeTime;
                    if (daysAgo == 0) {
                        long hoursAgo = java.time.temporal.ChronoUnit.HOURS.between(
                            c.getCreatedAt(), Instant.now());
                        if (hoursAgo < 1) {
                            relativeTime = "刚刚";
                        } else {
                            relativeTime = hoursAgo + "小时前";
                        }
                    } else if (daysAgo == 1) {
                        relativeTime = "昨天";
                    } else {
                        relativeTime = daysAgo + "天前";
                    }

                    String content = c.getContent();
                    if (content.length() > 20) {
                        content = content.substring(0, 20) + "...";
                    }

                    return RecentActivityDTO.builder()
                            .userId(c.getUser().getId().toString())
                            .nickname(c.getUser().getNickname())
                            .content(content)
                            .createdAt(c.getCreatedAt())
                            .relativeTime(relativeTime)
                            .build();
                })
                .collect(Collectors.toList());

        return TeamDTO.builder()
                .id(team.getId())
                .inviteCode(team.getInviteCode())
                .name(team.getName())
                .checkInTime(team.getCheckInTime())
                .memberCount(memberDTOs.size())
                .maxMembers(team.getMaxMembers())
                .status(team.getStatus().name())
                .todayAllCheckedIn(allCheckedIn)
                .togetherDays(togetherDays)
                .totalCheckIns(totalCheckIns)
                .members(memberDTOs)
                .recentActivities(recentActivities)
                .createdAt(team.getCreatedAt())
                .activatedAt(team.getActivatedAt())
                .build();
    }

    private String generateInviteCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
