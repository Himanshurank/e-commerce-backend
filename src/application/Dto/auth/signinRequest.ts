export class SigninRequestDto {
  public readonly email: string;
  public readonly password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email;
    this.password = data.password;

    this.validate();
  }

  static fromRequest(body: any): SigninRequestDto {
    return new SigninRequestDto({
      email: body.email,
      password: body.password,
    });
  }

  private validate(): void {
    if (!this.email || this.email.trim() === "") {
      throw new Error("Email is required");
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error("Invalid email format");
    }

    if (!this.password || this.password.trim() === "") {
      throw new Error("Password is required");
    }
  }
}
