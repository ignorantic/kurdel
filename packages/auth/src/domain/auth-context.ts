export interface AuthContext<TUser = any> {
  user: TUser;
  roles?: string[];
  permissions?: string[];
}
