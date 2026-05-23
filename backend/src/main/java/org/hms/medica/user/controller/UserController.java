package org.hms.medica.user.controller;

import lombok.RequiredArgsConstructor;
import org.hms.medica.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/hms/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/me/profile-photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateMyProfilePhoto(
            Principal principal,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateProfilePhoto(principal.getName(), file));
    }

    @PostMapping("/{id}/profile-photo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateUserProfilePhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateProfilePhoto(id, file));
    }
}
