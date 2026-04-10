import { useEffect, useMemo, useState } from "react";
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
  const [errored, setErrored] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setFilePreviewUrl("");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [file]);

  useEffect(() => {
    setErrored(false);
  }, [userId, src, version, filePreviewUrl]);

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
      src={errored ? defaultAvatar : resolvedSrc}
      alt={alt}
      className={avatarClassName}
      onError={(event) => {
        setErrored(true);
        onError?.(event);
      }}
      {...imgProps}
    />
  );
}
