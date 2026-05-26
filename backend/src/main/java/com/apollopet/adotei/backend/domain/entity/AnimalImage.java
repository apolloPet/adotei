package com.apollopet.adotei.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "animal_image")
@Getter
@Setter
@NoArgsConstructor
public class AnimalImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
}
