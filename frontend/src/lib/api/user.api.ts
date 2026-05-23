import apiClient from "./client";

export const userApi = {
  updateMyProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<string>("/users/me/profile-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateUserProfilePhoto: (userId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<string>(`/users/${userId}/profile-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
