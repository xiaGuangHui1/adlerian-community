package com.adlerian.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCheckInRequest {

    @NotBlank(message = "打卡内容不能为空")
    @Size(max = 2000, message = "打卡内容最多2000字")
    private String content;
}
