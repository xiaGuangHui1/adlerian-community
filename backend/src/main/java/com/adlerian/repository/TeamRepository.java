package com.adlerian.repository;

import com.adlerian.entity.Team;
import com.adlerian.entity.Team.TeamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, Long> {

    Optional<Team> findByInviteCode(String inviteCode);

    List<Team> findByStatusAndCreatorId(TeamStatus status, UUID creatorId);

    @Query("SELECT t FROM Team t JOIN TeamMember tm ON tm.team = t WHERE tm.user.id = :userId AND t.status = 'ACTIVE'")
    Optional<Team> findActiveTeamByUserId(@Param("userId") UUID userId);
}
