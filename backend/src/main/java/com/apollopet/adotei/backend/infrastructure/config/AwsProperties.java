package com.apollopet.adotei.backend.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.aws")
public record AwsProperties(
    String region,
    S3Properties s3
) {
    public record S3Properties(
        String bucket,
        String endpoint,
        String publicEndpoint,
        String accessKey,
        String secretKey,
        Long presignExpirationMinutes
    ) {}
}
