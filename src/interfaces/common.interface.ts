export interface LocationPayload {
  name : string;
  longitude : string;
  latitude : string;
}

export interface MemoryPayload {
  title : string;
  description : string;
  location : LocationPayload;
  images : string[];
  wallImage : string;
}