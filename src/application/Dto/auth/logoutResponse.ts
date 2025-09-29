export class LogoutResponseDto {
  public readonly success: boolean;
  public readonly message: string;
  public readonly loggedOutAt: Date;

  constructor(
    success: boolean = true,
    message: string = "Logged out successfully"
  ) {
    this.success = success;
    this.message = message;
    this.loggedOutAt = new Date();
  }

  static success(): LogoutResponseDto {
    return new LogoutResponseDto(true, "User logged out successfully");
  }

  static fromLogout(): LogoutResponseDto {
    return new LogoutResponseDto();
  }
}
