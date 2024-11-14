export interface LocationPayload {
  name: string;
  longitude: string;
  latitude: string;
}

export interface MemoryPayload {
  title: string;
  description: string;
  location: LocationPayload;
  images: string[];
  wallImage: string;
}

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  address: string;
  gender: string;
  birthday: Date;
  bio: string;
}

export interface ApiResponse<Type = any> {
  success: boolean;
  message: string;
  data?: Type;
}
