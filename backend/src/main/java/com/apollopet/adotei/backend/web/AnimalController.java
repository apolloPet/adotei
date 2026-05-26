package com.apollopet.adotei.backend.web;

import com.apollopet.adotei.backend.application.service.AnimalService;
import com.apollopet.adotei.backend.application.service.AnimalService.ImageBinary;
import com.apollopet.adotei.backend.web.dto.AnimalDtos.AnimalImageResponse;
import com.apollopet.adotei.backend.web.dto.AnimalDtos.AnimalRequest;
import com.apollopet.adotei.backend.web.dto.AnimalDtos.AnimalResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/animals")
public class AnimalController {

    private final AnimalService animalService;

    public AnimalController(AnimalService animalService) {
        this.animalService = animalService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO','ADOTANTE')")
    public List<AnimalResponse> list() {
        return animalService.list();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO','ADOTANTE')")
    public AnimalResponse get(@PathVariable UUID id) {
        return animalService.get(id);
    }

    @GetMapping("/images/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable UUID imageId) {
        ImageBinary image = animalService.getImageBinary(imageId);
        String contentType = image.contentType();
        MediaType mediaType = (contentType == null || contentType.isBlank())
            ? MediaType.APPLICATION_OCTET_STREAM
            : MediaType.parseMediaType(Objects.requireNonNull(contentType));
        return ResponseEntity.ok()
            .contentType(Objects.requireNonNull(mediaType))
            .body(image.data());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public AnimalResponse create(@Valid @RequestBody AnimalRequest request) {
        return animalService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    public AnimalResponse update(@PathVariable UUID id, @Valid @RequestBody AnimalRequest request) {
        return animalService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        animalService.delete(id);
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasAnyRole('ADMIN','VOLUNTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public AnimalImageResponse uploadImage(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "displayOrder", required = false) Integer displayOrder
    ) {
        return animalService.uploadImage(id, file, displayOrder);
    }
}
