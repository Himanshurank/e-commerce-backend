export class GetCartRequestDto {
  public readonly userId: string;

  constructor(data: { userId: string }) {
    this.userId = data.userId;
    this.validate();
  }

  static fromRequest(userId: string): GetCartRequestDto {
    return new GetCartRequestDto({ userId });
  }

  private validate(): void {
    if (!this.userId || this.userId.trim() === "") {
      throw new Error("User ID is required");
    }
  }
}
