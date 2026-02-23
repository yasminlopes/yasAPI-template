export interface UserInfo {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export type ProfileResponse = UserInfo;
