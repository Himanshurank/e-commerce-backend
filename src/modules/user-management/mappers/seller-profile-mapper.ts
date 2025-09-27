import {
  SellerProfileEntity,
  SellerProfileEntityProps,
} from "../domain/entities/seller-profile-entity";
import { v4 as uuidv4 } from "uuid";

export interface SellerProfilePersistenceData {
  id: string;
  user_id: string;
  business_name: string;
  business_description?: string | undefined;
  business_address: string; // JSON string
  business_phone: string;
  business_email: string;
  tax_id?: string | undefined;
  business_license?: string | undefined;
  commission_rate: number;
  is_verified: boolean;
  bank_account_details?: string | undefined; // JSON string
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface SellerProfileResponseDto {
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
  commissionRate: number;
  isVerified: boolean;
  bankAccountDetails?:
    | {
        accountHolderName: string;
        accountNumber: string;
        routingNumber: string;
        bankName: string;
      }
    | undefined;
  canReceivePayouts: boolean;
  hasCompleteProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfileCreateRequestDto {
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
}

export interface SellerProfileUpdateRequestDto {
  businessName?: string;
  businessDescription?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxId?: string;
  businessLicense?: string;
  businessAddress?: Partial<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  bankAccountDetails?: {
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
}

export class SellerProfileMapper {
  static toDomain(data: SellerProfilePersistenceData): SellerProfileEntity {
    const businessAddress = JSON.parse(data.business_address);
    const bankAccountDetails = data.bank_account_details
      ? JSON.parse(data.bank_account_details)
      : undefined;

    const props: SellerProfileEntityProps = {
      id: data.id,
      userId: data.user_id,
      businessName: data.business_name,
      businessDescription: data.business_description,
      businessAddress,
      businessPhone: data.business_phone,
      businessEmail: data.business_email,
      taxId: data.tax_id,
      businessLicense: data.business_license,
      commissionRate: data.commission_rate,
      isVerified: data.is_verified,
      bankAccountDetails,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return SellerProfileEntity.create(props);
  }

  static toPersistence(
    sellerProfile: SellerProfileEntity
  ): SellerProfilePersistenceData {
    const props = sellerProfile.getProps();

    return {
      id: props.id || uuidv4(),
      user_id: props.userId,
      business_name: props.businessName,
      business_description: props.businessDescription,
      business_address: JSON.stringify(props.businessAddress),
      business_phone: props.businessPhone,
      business_email: props.businessEmail,
      tax_id: props.taxId,
      business_license: props.businessLicense,
      commission_rate: props.commissionRate,
      is_verified: props.isVerified,
      bank_account_details: props.bankAccountDetails
        ? JSON.stringify(props.bankAccountDetails)
        : undefined,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
    };
  }

  static toResponseDto(
    sellerProfile: SellerProfileEntity
  ): SellerProfileResponseDto {
    return {
      id: sellerProfile.getId(),
      userId: sellerProfile.getUserId(),
      businessName: sellerProfile.getBusinessName(),
      businessDescription: sellerProfile.getBusinessDescription(),
      businessAddress: sellerProfile.getBusinessAddress(),
      businessPhone: sellerProfile.getBusinessPhone(),
      businessEmail: sellerProfile.getBusinessEmail(),
      taxId: sellerProfile.getTaxId(),
      businessLicense: sellerProfile.getBusinessLicense(),
      commissionRate: sellerProfile.getCommissionRate(),
      isVerified: sellerProfile.isBusinessVerified(),
      bankAccountDetails: sellerProfile.getBankAccountDetails(),
      canReceivePayouts: sellerProfile.canReceivePayouts(),
      hasCompleteProfile: sellerProfile.hasCompleteProfile(),
      createdAt: sellerProfile.getCreatedAt().toISOString(),
      updatedAt: sellerProfile.getUpdatedAt().toISOString(),
    };
  }

  static toResponseDtoList(
    sellerProfiles: SellerProfileEntity[]
  ): SellerProfileResponseDto[] {
    return sellerProfiles.map((profile) => this.toResponseDto(profile));
  }

  static fromCreateRequest(
    userId: string,
    data: SellerProfileCreateRequestDto
  ): {
    userId: string;
    businessName: string;
    businessDescription?: string | undefined;
    businessAddress: SellerProfileEntityProps["businessAddress"];
    businessPhone: string;
    businessEmail: string;
    taxId?: string | undefined;
    businessLicense?: string | undefined;
  } {
    return {
      userId,
      businessName: data.businessName.trim(),
      businessDescription: data.businessDescription?.trim(),
      businessAddress: {
        street: data.businessAddress.street.trim(),
        city: data.businessAddress.city.trim(),
        state: data.businessAddress.state.trim(),
        postalCode: data.businessAddress.postalCode.trim(),
        country: data.businessAddress.country.trim(),
      },
      businessPhone: data.businessPhone.trim(),
      businessEmail: data.businessEmail.toLowerCase().trim(),
      taxId: data.taxId?.trim(),
      businessLicense: data.businessLicense?.trim(),
    };
  }

  static fromUpdateRequest(data: SellerProfileUpdateRequestDto): Partial<{
    businessName: string;
    businessDescription: string;
    businessPhone: string;
    businessEmail: string;
    taxId: string;
    businessLicense: string;
  }> & {
    businessAddress?: Partial<SellerProfileEntityProps["businessAddress"]>;
    bankAccountDetails?: SellerProfileEntityProps["bankAccountDetails"];
  } {
    const updateData: any = {};

    if (data.businessName !== undefined) {
      updateData.businessName = data.businessName.trim();
    }

    if (data.businessDescription !== undefined) {
      updateData.businessDescription = data.businessDescription?.trim();
    }

    if (data.businessPhone !== undefined) {
      updateData.businessPhone = data.businessPhone.trim();
    }

    if (data.businessEmail !== undefined) {
      updateData.businessEmail = data.businessEmail.toLowerCase().trim();
    }

    if (data.taxId !== undefined) {
      updateData.taxId = data.taxId?.trim();
    }

    if (data.businessLicense !== undefined) {
      updateData.businessLicense = data.businessLicense?.trim();
    }

    if (data.businessAddress) {
      updateData.businessAddress = {};
      if (data.businessAddress.street)
        updateData.businessAddress.street = data.businessAddress.street.trim();
      if (data.businessAddress.city)
        updateData.businessAddress.city = data.businessAddress.city.trim();
      if (data.businessAddress.state)
        updateData.businessAddress.state = data.businessAddress.state.trim();
      if (data.businessAddress.postalCode)
        updateData.businessAddress.postalCode =
          data.businessAddress.postalCode.trim();
      if (data.businessAddress.country)
        updateData.businessAddress.country =
          data.businessAddress.country.trim();
    }

    if (data.bankAccountDetails) {
      updateData.bankAccountDetails = {
        accountHolderName: data.bankAccountDetails.accountHolderName.trim(),
        accountNumber: data.bankAccountDetails.accountNumber.trim(),
        routingNumber: data.bankAccountDetails.routingNumber.trim(),
        bankName: data.bankAccountDetails.bankName.trim(),
      };
    }

    return updateData;
  }

  // Helper method for creating seller profile entities from request data
  static createSellerProfileEntity(data: {
    userId: string;
    businessName: string;
    businessDescription?: string;
    businessAddress: SellerProfileEntityProps["businessAddress"];
    businessPhone: string;
    businessEmail: string;
    taxId?: string;
    businessLicense?: string;
  }): SellerProfileEntity {
    return SellerProfileEntity.createNew(data);
  }

  // Commission calculation helpers
  static toCommissionCalculationDto(
    sellerProfile: SellerProfileEntity,
    saleAmount: number
  ): {
    saleAmount: number;
    commissionRate: number;
    commissionAmount: number;
    sellerPayout: number;
  } {
    return {
      saleAmount,
      commissionRate: sellerProfile.getCommissionRate(),
      commissionAmount: sellerProfile.calculateCommissionAmount(saleAmount),
      sellerPayout: sellerProfile.calculateSellerPayout(saleAmount),
    };
  }

  // Verification status mapping
  static toVerificationStatusDto(sellerProfile: SellerProfileEntity): {
    isVerified: boolean;
    canReceivePayouts: boolean;
    hasCompleteProfile: boolean;
    hasBankAccountDetails: boolean;
    missingRequirements: string[];
  } {
    const missingRequirements: string[] = [];

    if (!sellerProfile.hasCompleteProfile()) {
      missingRequirements.push("Complete business profile information");
    }

    if (!sellerProfile.hasBankAccountDetails()) {
      missingRequirements.push("Bank account details");
    }

    if (!sellerProfile.isBusinessVerified()) {
      missingRequirements.push("Business verification");
    }

    return {
      isVerified: sellerProfile.isBusinessVerified(),
      canReceivePayouts: sellerProfile.canReceivePayouts(),
      hasCompleteProfile: sellerProfile.hasCompleteProfile(),
      hasBankAccountDetails: sellerProfile.hasBankAccountDetails(),
      missingRequirements,
    };
  }
}
