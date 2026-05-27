package com.adlerian.service;

import com.adlerian.dto.CreateGroupRequest;
import com.adlerian.dto.GroupDTO;
import com.adlerian.dto.PostDTO;
import com.adlerian.entity.GroupMember;
import com.adlerian.entity.StudyGroup;
import com.adlerian.entity.User;
import com.adlerian.repository.GroupMemberRepository;
import com.adlerian.repository.GroupRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    public Page<GroupDTO> getGroups(String category, Pageable pageable) {
        Page<StudyGroup> groups;
        if (category != null && !category.isBlank()) {
            groups = groupRepository.findByCategory(category, pageable);
        } else {
            groups = groupRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return groups.map(g -> toDTO(g, null));
    }

    public GroupDTO getGroupById(Long id, UUID userId) {
        StudyGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("小组不存在"));
        return toDTO(group, userId);
    }

    @Transactional
    public GroupDTO createGroup(UUID creatorId, CreateGroupRequest request) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        StudyGroup group = StudyGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .maxMembers(request.getMaxMembers())
                .creator(creator)
                .build();
        group = groupRepository.save(group);

        // 创建者自动加入小组
        GroupMember member = GroupMember.builder()
                .groupId(group.getId())
                .userId(creatorId)
                .build();
        memberRepository.save(member);

        return toDTO(group, creatorId);
    }

    @Transactional
    public void joinGroup(Long groupId, UUID userId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("小组不存在"));
        if (memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new RuntimeException("已经加入该小组");
        }
        int currentMembers = memberRepository.countByGroupId(groupId);
        if (currentMembers >= group.getMaxMembers()) {
            throw new RuntimeException("小组人数已满");
        }
        GroupMember member = GroupMember.builder()
                .groupId(groupId)
                .userId(userId)
                .build();
        memberRepository.save(member);
    }

    @Transactional
    public void leaveGroup(Long groupId, UUID userId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("小组不存在"));
        if (group.getCreator().getId().equals(userId)) {
            throw new RuntimeException("创建者不能退出小组");
        }
        memberRepository.deleteById(new com.adlerian.entity.GroupMemberId(groupId, userId));
    }

    private GroupDTO toDTO(StudyGroup group, UUID userId) {
        return GroupDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .category(group.getCategory())
                .maxMembers(group.getMaxMembers())
                .currentMembers(memberRepository.countByGroupId(group.getId()))
                .creator(PostDTO.AuthorDTO.builder()
                        .id(group.getCreator().getId())
                        .nickname(group.getCreator().getNickname())
                        .avatarUrl(group.getCreator().getAvatarUrl())
                        .build())
                .createdAt(group.getCreatedAt())
                .joined(userId != null && memberRepository.existsByGroupIdAndUserId(group.getId(), userId))
                .build();
    }
}
