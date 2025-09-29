import { UserRole } from "../../../domain/enum/userRole";

export class SignupRequestDto {
  public readonly email: string;
  public readonly password: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly phone: string | undefined;
  public readonly role: UserRole | undefined;

  constructor(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }) {
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phone = data.phone;
    this.role = data.role || UserRole.CUSTOMER;

    this.validate();
  }

  static fromRequest(body: any): SignupRequestDto {
    return new SignupRequestDto({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      role: body.role,
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

    // Password strength validation
    if (this.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(this.password)) {
      throw new Error("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(this.password)) {
      throw new Error("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(this.password)) {
      throw new Error("Password must contain at least one number");
    }

    if (!this.firstName || this.firstName.trim() === "") {
      throw new Error("First name is required");
    }

    if (this.firstName.length < 2) {
      throw new Error("First name must be at least 2 characters long");
    }

    if (!this.lastName || this.lastName.trim() === "") {
      throw new Error("Last name is required");
    }

    if (this.lastName.length < 2) {
      throw new Error("Last name must be at least 2 characters long");
    }

    // Phone validation (optional)
    if (this.phone && this.phone.trim() !== "") {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(this.phone)) {
        throw new Error("Invalid phone number format");
      }
    }

    // Role validation
    if (this.role && !Object.values(UserRole).includes(this.role)) {
      throw new Error("Invalid user role");
    }
  }
}
