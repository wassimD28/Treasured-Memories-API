export enum ModelTypeName {
  USER = "user",
  MEMORY = "memory",
  ALBUM = "album",
  PROFILE = "profile",
  COMMENT = "comment",
  NOTIFICATION = "notification",
}
export enum ModelWithImage {
  PROFILE = "profile",
  MEMORY = "memory",
}
export enum ImageTypeName {
  IMAGES = "images", // images column in memories table
  WALL_IMAGE = "wallImage", // wallImage column in profile table
  AVATAR_IMAGE = "avatarImage", // avatarImage column in profile table
}
export enum NotificationTapeName {
  NEW_FOLLOWER = "NEW_FOLLOWER",
  LIKE = "LIKE",
  COMMENT = "COMMENT",
}

export enum ReportReason {
  ABUSIVE_CONTENT = "ABUSIVE_CONTENT",
  INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
  MISLEADING_INFORMATION = "MISLEADING_INFORMATION",
  COPYRIGHT_VIOLATION = "COPYRIGHT_VIOLATION",
  OTHER = "OTHER",
}
export enum ReportType {
  COMMENT = "COMMENT",
  MEMORY = "MEMORY",
  PERSON = "PERSON",
}

export enum Gender{
  MALE = "Male",
  FEMALE = "Female",
  NOT_SPECIFIED = "not_specified",// that means that the user account is new and still did't specify his gender
}