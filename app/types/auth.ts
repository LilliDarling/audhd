export interface SignInRequest {
    username: string;
    password: string;
}
  
export interface SignUpRequest {
    username: string;
    name: string;
    email: string;
    password: string;
}
  
export interface UserResponse {
    id: string;
    username: string;
}
  
export interface AuthError {
    detail: string;
    code?: string;
    field?: string;
}
  
export type AuthState = {
    user: UserResponse | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
};