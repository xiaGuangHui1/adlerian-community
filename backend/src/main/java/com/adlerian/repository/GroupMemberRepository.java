package com.adlerian.repository;

import com.adlerian.entity.GroupMember;
import com.adlerian.entity.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    List<GroupMember> findByGroupId(Long groupId);
    List<GroupMember> findByUserId(UUID userId);
    int countByGroupId(Long groupId);
    boolean existsByGroupIdAndUserId(Long groupId, UUID userId);
}
