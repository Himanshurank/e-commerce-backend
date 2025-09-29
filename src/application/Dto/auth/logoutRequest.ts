export class LogoutRequestDto {
  public readonly userId?: string; // Optional - can be extracted from token/session

  constructor(data: { userId?: string }) {
    if (data.userId !== undefined) {
      this.userId = data.userId;
    }
    this.validate();
  }

  static fromRequest(body: any, userId?: string): LogoutRequestDto {
    return new LogoutRequestDto({
      userId: userId || body.userId,
    });
  }

  private validate(): void {
    // For basic logout, no validation needed
    // In future with JWT tokens, we might validate token format
  }
}
