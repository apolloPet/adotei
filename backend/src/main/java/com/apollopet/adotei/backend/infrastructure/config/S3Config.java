package com.apollopet.adotei.backend.infrastructure.config;

import java.net.URI;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@EnableConfigurationProperties(AwsProperties.class)
public class S3Config {

    @Bean
    S3Client s3Client(AwsProperties props) {
        var builder = S3Client.builder()
            .region(Region.of(props.region()))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(props.s3().accessKey(), props.s3().secretKey())
                )
            );

        if (props.s3().endpoint() != null && !props.s3().endpoint().isBlank()) {
            builder
                .endpointOverride(URI.create(props.s3().endpoint()))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        }

        return builder.build();
    }

    @Bean
    S3Presigner s3Presigner(AwsProperties props) {
        var builder = S3Presigner.builder()
            .region(Region.of(props.region()))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(props.s3().accessKey(), props.s3().secretKey())
                )
            );

        String presignEndpoint = resolvePublicEndpoint(props);
        if (presignEndpoint != null) {
            builder
                .endpointOverride(URI.create(presignEndpoint))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build());
        }

        return builder.build();
    }

    private static String resolvePublicEndpoint(AwsProperties props) {
        if (props.s3().publicEndpoint() != null && !props.s3().publicEndpoint().isBlank()) {
            return props.s3().publicEndpoint();
        }
        if (props.s3().endpoint() != null && !props.s3().endpoint().isBlank()) {
            return props.s3().endpoint();
        }
        return null;
    }
}
