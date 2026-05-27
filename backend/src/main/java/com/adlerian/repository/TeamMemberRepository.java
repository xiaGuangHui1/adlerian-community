package com.adlerian.repository;

import com.adlerian.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    List<TeamMember> findByTeamIdOrderByJoinedAtAsc(Long teamId);

    long countByTeamId(Long teamId);

    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, UUID userId);
}
