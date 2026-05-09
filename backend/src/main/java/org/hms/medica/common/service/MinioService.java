package org.hms.medica.common.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hms.medica.config.MinioConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    public String upload(MultipartFile file, String folder) {
        String objectName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        try {
            boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(minioConfig.getBucket()).build());
            if (!exists) {
                minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(minioConfig.getBucket()).build());
            }

            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(minioConfig.getBucket())
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            return minioConfig.getEndpoint() + "/" + minioConfig.getBucket() + "/" + objectName;
        } catch (Exception e) {
            log.error("MinIO upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("File upload failed", e);
        }
    }

    public void delete(String objectName) {
        try {
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(minioConfig.getBucket())
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.warn("MinIO delete failed for {}: {}", objectName, e.getMessage());
        }
    }

    public String uploadProfilePhoto(MultipartFile file) { return upload(file, "profiles"); }
    public String uploadLabReportFile(MultipartFile file) { return upload(file, "lab-reports"); }
    public String uploadChatImage(MultipartFile file)     { return upload(file, "chat-images"); }
}
