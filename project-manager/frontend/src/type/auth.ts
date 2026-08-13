export interface DataLogin {
  username: string;
  password: string;
}

export interface UpdatePassword {
  username: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}