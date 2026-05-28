package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.application.exception.NotFoundException;
import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(payload(HttpStatus.NOT_FOUND, ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.badRequest().body(payload(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        StringBuilder message = new StringBuilder("Erro de validacao");
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            message.append(" | ").append(fieldError.getField()).append(": ").append(fieldError.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(payload(HttpStatus.BAD_REQUEST, message.toString()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(payload(HttpStatus.FORBIDDEN, "Acesso negado"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(payload(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor"));
    }

    private Map<String, Object> payload(HttpStatus status, String message) {
        return Map.of(
            "timestamp", OffsetDateTime.now().toString(),
            "status", status.value(),
            "error", status.getReasonPhrase(),
            "message", message
        );
    }
}
