export interface SellerProfileEntityProps {
  id: string;
  userId: string;
  businessName: string;
  businessDescription?: string | undefined;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  businessPhone: string;
  businessEmail: string;
  taxId?: string | undefined;
  businessLicense?: string | undefined;
  commissionRate: number; // Percentage (e.g., 5.0 for 5%)
  isVerified: boolean;
  bankAccountDetails?:
    | {
        accountHolderName: string;
        accountNumber: string;
        routingNumber: string;
        bankName: string;
      }
    | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class SellerProfileEntity {
  private props!: SellerProfileEntityProps;

  static create(props: SellerProfileEntityProps): SellerProfileEntity {
    const sellerProfile = new SellerProfileEntity();
    sellerProfile.props = props;
    return sellerProfile;
  }

  static createNew(data: {
    userId: string;
    businessName: string;
    businessDescription?: string;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    businessPhone: string;
    businessEmail: string;
    taxId?: string;
    businessLicense?: string;
  }): SellerProfileEntity {
    return SellerProfileEntity.create({
      id: "", // Will be set by repository
      userId: data.userId,
      businessName: data.businessName,
      businessDescription: data.businessDescription,
      businessAddress: data.businessAddress,
      businessPhone: data.businessPhone,
      businessEmail: data.businessEmail,
      taxId: data.taxId,
      businessLicense: data.businessLicense,
      commissionRate: 5.0, // Default 5% commission
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Getters
  getId(): string {
    return this.props.id;
  }

  getUserId(): string {
    return this.props.userId;
  }

  getBusinessName(): string {
    return this.props.businessName;
  }

  getBusinessDescription(): string | undefined {
    return this.props.businessDescription;
  }

  getBusinessAddress(): SellerProfileEntityProps["businessAddress"] {
    return { ...this.props.businessAddress };
  }

  getBusinessPhone(): string {
    return this.props.businessPhone;
  }

  getBusinessEmail(): string {
    return this.props.businessEmail;
  }

  getTaxId(): string | undefined {
    return this.props.taxId;
  }

  getBusinessLicense(): string | undefined {
    return this.props.businessLicense;
  }

  getCommissionRate(): number {
    return this.props.commissionRate;
  }

  isBusinessVerified(): boolean {
    return this.props.isVerified;
  }

  getBankAccountDetails(): SellerProfileEntityProps["bankAccountDetails"] {
    return this.props.bankAccountDetails
      ? { ...this.props.bankAccountDetails }
      : undefined;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  getProps(): SellerProfileEntityProps {
    return { ...this.props };
  }

  // Business Logic Methods
  canReceivePayouts(): boolean {
    return this.props.isVerified && this.hasBankAccountDetails();
  }

  hasBankAccountDetails(): boolean {
    return !!this.props.bankAccountDetails;
  }

  hasCompleteProfile(): boolean {
    return !!(
      this.props.businessName &&
      this.props.businessPhone &&
      this.props.businessEmail &&
      this.props.businessAddress.street &&
      this.props.businessAddress.city &&
      this.props.businessAddress.state &&
      this.props.businessAddress.postalCode
    );
  }

  calculateCommissionAmount(saleAmount: number): number {
    return (saleAmount * this.props.commissionRate) / 100;
  }

  calculateSellerPayout(saleAmount: number): number {
    return saleAmount - this.calculateCommissionAmount(saleAmount);
  }

  // State Modification Methods
  verify(): void {
    this.props.isVerified = true;
    this.props.updatedAt = new Date();
  }

  unverify(): void {
    this.props.isVerified = false;
    this.props.updatedAt = new Date();
  }

  updateCommissionRate(newRate: number): void {
    if (newRate < 0 || newRate > 100) {
      throw new Error("Commission rate must be between 0 and 100");
    }
    this.props.commissionRate = newRate;
    this.props.updatedAt = new Date();
  }

  updateBusinessInfo(data: {
    businessName?: string;
    businessDescription?: string;
    businessPhone?: string;
    businessEmail?: string;
    taxId?: string;
    businessLicense?: string;
  }): void {
    if (data.businessName) this.props.businessName = data.businessName;
    if (data.businessDescription !== undefined)
      this.props.businessDescription = data.businessDescription;
    if (data.businessPhone) this.props.businessPhone = data.businessPhone;
    if (data.businessEmail) this.props.businessEmail = data.businessEmail;
    if (data.taxId !== undefined) this.props.taxId = data.taxId;
    if (data.businessLicense !== undefined)
      this.props.businessLicense = data.businessLicense;
    this.props.updatedAt = new Date();
  }

  updateBusinessAddress(
    address: Partial<SellerProfileEntityProps["businessAddress"]>
  ): void {
    this.props.businessAddress = { ...this.props.businessAddress, ...address };
    this.props.updatedAt = new Date();
  }

  updateBankAccountDetails(
    bankDetails: SellerProfileEntityProps["bankAccountDetails"]
  ): void {
    this.props.bankAccountDetails = bankDetails;
    this.props.updatedAt = new Date();
  }
}
