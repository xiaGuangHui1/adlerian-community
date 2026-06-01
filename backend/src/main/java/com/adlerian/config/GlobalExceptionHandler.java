package com.adlerian.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;

/**
 * 全局异常处理器 — 捕获所有未被 controller 内 try-catch 覆盖的异常，
 * 返回结构化 JSON 错误信息，避免 "500 Internal Server Error" 无详情。
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<Map<String, Object>> handleMissingHeader(MissingRequestHeaderException e) {
        log.warn("Missing required header: {}", e.getHeaderName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "缺少必要请求头: " + e.getHeaderName(),
                "code", 400
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
        log.warn("Invalid argument: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "参数错误",
                "code", 400
        ));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoResourceFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "接口不存在",
                "code", 404
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAll(Exception e) {
        log.error("Unhandled exception: {} ({})",
                e.getMessage(), e.getClass().getSimpleName(), e);
        String msg = e.getMessage();
        if (msg == null || msg.isBlank()) {
            msg = e.getClass().getSimpleName();
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", msg,
                "type", e.getClass().getSimpleName(),
                "code", 500
        ));
    }
}
