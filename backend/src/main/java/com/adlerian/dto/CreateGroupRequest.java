package com.adlerian.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateGroupRequest {
    @NotBlank(message = "小组名称不能为空")
    @Size(max = 100, message = "名称最多100字")
    private String name;

    private String description;
    private String category;
    private int maxMembers = 20;
}
