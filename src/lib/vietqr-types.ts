/**
 * VietQR Types and Constants
 */

export type InitiationMethod = '11' | '12'; // 11 = Static, 12 = Dynamic
export type ServiceCode = 'QRIBFTTA' | 'QRIBFTTC'; // QRIBFTTA = Account, QRIBFTTC = Card

export interface VietQRFormData {
  // QR Type
  initiationMethod: InitiationMethod;

  // Service
  serviceCode: ServiceCode;

  // Bank & Account
  bnbId: string; // 6-digit BIN
  accountId: string; // Consumer/Account/Card ID (max 19 chars)

  // Transaction
  amount?: string; // Optional for static, required for dynamic
  currency?: string; // ISO 4217 (default: 704 = VND)

  // Location
  countryCode?: string; // ISO 3166-1 alpha-2 (default: VN)

  // Additional Data (ID62)
  additionalData?: {
    billNumber?: string; // ID62.01
    mobileNumber?: string; // ID62.02
    storeLabel?: string; // ID62.03
    loyaltyNumber?: string; // ID62.04
    referenceLabel?: string; // ID62.05
    customerLabel?: string; // ID62.06
    terminalLabel?: string; // ID62.07
    purposeOfTransaction?: string; // ID62.08
    additionalConsumerDataRequest?: string; // ID62.09
  };
}

export interface GeneratedQR {
  payload: string;
  crc: string;
  svg: string;
  pngDataUrl: string;
}

export interface ParsedVietQR {
  raw: string;
  fields: Array<{
    id: string;
    name: string;
    length: number;
    value: string;
    subFields?: Array<{
      id: string;
      name: string;
      value: string;
    }>;
  }>;
  extracted: {
    initiationMethod?: InitiationMethod;
    serviceCode?: ServiceCode;
    bnbId?: string;
    accountId?: string;
    amount?: string;
    currency?: string;
    countryCode?: string;
    additionalData?: Record<string, string>;
  };
}

export interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationReport {
  isValid: boolean;
  crcValid: boolean;
  issues: ValidationIssue[];
}

// VietQR Field Definitions
export const VIETQR_FIELDS: Record<string, string> = {
  '00': 'Payload Format Indicator',
  '01': 'Point of Initiation Method',
  '38': 'Merchant Account Information (VietQR)',
  '52': 'Merchant Category Code',
  '53': 'Transaction Currency',
  '54': 'Transaction Amount',
  '55': 'Tip or Convenience Indicator',
  '56': 'Value of Convenience Fee Fixed',
  '57': 'Value of Convenience Fee Percentage',
  '58': 'Country Code',
  '59': 'Merchant Name',
  '60': 'Merchant City',
  '61': 'Postal Code',
  '62': 'Additional Data Field Template',
  '63': 'CRC',
  '64': 'Merchant Information—Language Template',
};

export const VIETQR_38_SUBFIELDS: Record<string, string> = {
  '00': 'AID (Application Identifier)',
  '01': 'Beneficiary Organization (BNB + Account/Card)',
  '02': 'Service Code',
};

export const VIETQR_62_SUBFIELDS: Record<string, string> = {
  '01': 'Bill Number',
  '02': 'Mobile Number',
  '03': 'Store Label',
  '04': 'Loyalty Number',
  '05': 'Reference Label',
  '06': 'Customer Label',
  '07': 'Terminal Label',
  '08': 'Purpose of Transaction',
  '09': 'Additional Consumer Data Request',
};

// Constants
export const NAPAS_AID = 'A000000727';
export const PAYLOAD_FORMAT_INDICATOR = '01';
export const CURRENCY_VND = '704';
export const COUNTRY_VIETNAM = 'VN';
