package org.hms.medica.user.service;

import lombok.RequiredArgsConstructor;
import org.hms.medica.common.service.MinioService;
import org.hms.medica.user.model.User;
import org.hms.medica.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MinioService minioService;

    @Transactional
    public String updateProfilePhoto(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        
        return saveProfilePhoto(user, file);
    }

    @Transactional
    public String updateProfilePhoto(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return saveProfilePhoto(user, file);
    }

    private String saveProfilePhoto(User user, MultipartFile file) {
        // Delete old photo if exists
        if (user.getProfilePhotoUrl() != null) {
            try {
                String oldObjectName = user.getProfilePhotoUrl().substring(user.getProfilePhotoUrl().lastIndexOf("profiles/"));
                minioService.delete(oldObjectName);
            } catch (Exception e) {
                // Ignore errors if file doesn't exist or URL format is unexpected
            }
        }

        String photoUrl = minioService.uploadProfilePhoto(file);
        user.setProfilePhotoUrl(photoUrl);
        userRepository.save(user);
        return photoUrl;
    }
}
