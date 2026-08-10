package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.exception.BadRequestException;
import com.apollopet.adotei.backend.application.exception.NotFoundException;
import java.time.OffsetDateTime;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

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
        String message = ex.getMessage();
        if (message == null || message.isBlank()) {
            message = "Acesso negado";
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(payload(HttpStatus.FORBIDDEN, message));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Violacao de integridade de dados", ex);
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(payload(HttpStatus.CONFLICT, "Operacao nao permitida: violacao de integridade"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        log.warn("Upload acima do limite", ex);
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body(payload(HttpStatus.PAYLOAD_TOO_LARGE, "Imagem acima do limite de 5MB. Reduza o tamanho e tente novamente."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Erro nao tratado", ex);
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
