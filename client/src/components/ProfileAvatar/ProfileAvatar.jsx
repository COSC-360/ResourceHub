import { useEffect, useMemo } from "react";
import defaultAvatar from "../../assets/profile.svg";
import "./ProfileAvatar.css";

function buildUserPhotoUrl(userId, version) {
  if (!userId) return "";
  const encodedUserId = encodeURIComponent(String(userId));
  let url = `/api/user/getProfilePhoto/${encodedUserId}`;
  if (version !== undefined && version !== null && String(version) !== "") {
    url += `?v=${encodeURIComponent(String(version))}`;
  }
  return url;
}

export default function ProfileAvatar({
  userId,
  src,
  file,
  version,
  alt = "Profile avatar",
  className = "",
  shape = "circle",
  onError,
  ...imgProps
}) {
  const filePreviewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const resolvedSrc = useMemo(() => {
    if (filePreviewUrl) return filePreviewUrl;
    if (src) return src;
    if (userId) return buildUserPhotoUrl(userId, version);
    return defaultAvatar;
  }, [filePreviewUrl, src, userId, version]);

  const avatarClassName = [
    "rh-profile-avatar",
    `rh-profile-avatar--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={avatarClassName}
      onError={(event) => {
        if (event.currentTarget.src !== defaultAvatar) {
          event.currentTarget.src = defaultAvatar;
        }
        onError?.(event);
      }}
      {...imgProps}
    />
  );
}
