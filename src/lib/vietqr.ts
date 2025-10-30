/**
 * VietQR Core Logic
 * Generate and parse VietQR codes according to VietQR specifications
 */

import QRCode from 'qrcode';
import { BrowserQRCodeReader } from '@zxing/browser';
import { encodeTLV, decodeTLV, decodeNestedTLV, findTLVField } from './tlv';
import { crc16ccittFalse } from './crc16';
import type {
  VietQRFormData,
  GeneratedQR,
  ParsedVietQR,
  ValidationReport,
  ValidationIssue,
} from './vietqr-types';
import {
  NAPAS_AID,
  PAYLOAD_FORMAT_INDICATOR,
  CURRENCY_VND,
  COUNTRY_VIETNAM,
  VIETQR_FIELDS,
  VIETQR_38_SUBFIELDS,
  VIETQR_62_SUBFIELDS,
} from './vietqr-types';

/**
 * Build VietQR payload and generate QR code
 */
export async function buildVietQR(formData: VietQRFormData): Promise<GeneratedQR> {
  const {
    initiationMethod,
    serviceCode,
    bnbId,
    accountId,
    amount,
    currency = CURRENCY_VND,
    countryCode = COUNTRY_VIETNAM,
    additionalData,
  } = formData;

  // Validate inputs
  if (!/^\d{6}$/.test(bnbId)) {
    throw new Error('BNB ID must be exactly 6 digits');
  }
  if (accountId.length > 19) {
    throw new Error('Account ID must be max 19 characters');
  }

  const fields: Array<{ id: string; value: string }> = [];

  // ID00: Payload Format Indicator
  fields.push({ id: '00', value: PAYLOAD_FORMAT_INDICATOR });

  // ID01: Point of Initiation Method
  fields.push({ id: '01', value: initiationMethod });

  // ID38: Merchant Account Information (VietQR via NAPAS)
  const id38SubFields = [
    { id: '00', value: NAPAS_AID },
    { id: '01', value: bnbId + accountId },
    { id: '02', value: serviceCode },
  ];
  const id38Value = encodeTLV(id38SubFields);
  fields.push({ id: '38', value: id38Value });

  // ID53: Transaction Currency
  fields.push({ id: '53', value: currency });

  // ID54: Transaction Amount (if provided)
  if (amount && amount.trim()) {
    // Validate amount format
    if (!/^\d+(\.\d+)?$/.test(amount)) {
      throw new Error('Amount must be numeric (digits and optional decimal point)');
    }
    fields.push({ id: '54', value: amount });
  }

  // ID58: Country Code
  fields.push({ id: '58', value: countryCode });

  // ID62: Additional Data Field Template (if provided)
  if (additionalData && Object.keys(additionalData).length > 0) {
    const id62SubFields: Array<{ id: string; value: string }> = [];

    if (additionalData.billNumber)
      id62SubFields.push({ id: '01', value: additionalData.billNumber });
    if (additionalData.mobileNumber)
      id62SubFields.push({ id: '02', value: additionalData.mobileNumber });
    if (additionalData.storeLabel)
      id62SubFields.push({ id: '03', value: additionalData.storeLabel });
    if (additionalData.loyaltyNumber)
      id62SubFields.push({ id: '04', value: additionalData.loyaltyNumber });
    if (additionalData.referenceLabel)
      id62SubFields.push({ id: '05', value: additionalData.referenceLabel });
    if (additionalData.customerLabel)
      id62SubFields.push({ id: '06', value: additionalData.customerLabel });
    if (additionalData.terminalLabel)
      id62SubFields.push({ id: '07', value: additionalData.terminalLabel });
    if (additionalData.purposeOfTransaction)
      id62SubFields.push({ id: '08', value: additionalData.purposeOfTransaction });
    if (additionalData.additionalConsumerDataRequest)
      id62SubFields.push({ id: '09', value: additionalData.additionalConsumerDataRequest });

    if (id62SubFields.length > 0) {
      const id62Value = encodeTLV(id62SubFields);
      fields.push({ id: '62', value: id62Value });
    }
  }

  // Build payload without CRC
  const payloadWithoutCRC = encodeTLV(fields) + '6304';

  // Calculate CRC
  const crc = crc16ccittFalse(payloadWithoutCRC);

  // Complete payload
  const payload = payloadWithoutCRC + crc;

  // Generate QR codes
  const svg = await QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
  });

  const pngDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
  });

  return {
    payload,
    crc,
    svg,
    pngDataUrl,
  };
}

/**
 * Parse VietQR from payload string or image file
 */
export async function parseVietQR(input: string | File): Promise<ParsedVietQR> {
  let payload: string;

  if (typeof input === 'string') {
    // Direct payload
    payload = input.trim();
  } else {
    // Decode QR image using ZXing
    const reader = new BrowserQRCodeReader();
    try {
      const imageUrl = URL.createObjectURL(input);
      const result = await reader.decodeFromImageUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);
      payload = result.getText();
    } catch (error) {
      throw new Error('Failed to decode QR code from image: ' + (error as Error).message);
    }
  }

  // Decode TLV
  const rootFields = decodeTLV(payload);

  // Parse fields with names
  const fields = rootFields.map((field) => {
    const name = VIETQR_FIELDS[field.id] || `Unknown Field ${field.id}`;

    // Decode nested fields for ID38 and ID62
    let subFields;
    if (field.id === '38') {
      const nested = decodeNestedTLV(field.value);
      subFields = nested.map((sf) => ({
        id: sf.id,
        name: VIETQR_38_SUBFIELDS[sf.id] || `Unknown SubField ${sf.id}`,
        value: sf.value,
      }));
    } else if (field.id === '62') {
      const nested = decodeNestedTLV(field.value);
      subFields = nested.map((sf) => ({
        id: sf.id,
        name: VIETQR_62_SUBFIELDS[sf.id] || `Unknown SubField ${sf.id}`,
        value: sf.value,
      }));
    }

    return {
      id: field.id,
      name,
      length: field.length,
      value: field.value,
      subFields,
    };
  });

  // Extract key information
  const extracted: ParsedVietQR['extracted'] = {};

  // ID01: Initiation Method
  const id01 = findTLVField(rootFields, '01');
  if (id01 && (id01.value === '11' || id01.value === '12')) {
    extracted.initiationMethod = id01.value as '11' | '12';
  }

  // ID38: Parse BNB, Account, Service Code
  const id38 = findTLVField(rootFields, '38');
  if (id38) {
    const id38Fields = decodeNestedTLV(id38.value);
    const id38_01 = findTLVField(id38Fields, '01');
    if (id38_01 && id38_01.value.length >= 6) {
      extracted.bnbId = id38_01.value.substring(0, 6);
      extracted.accountId = id38_01.value.substring(6);
    }
    const id38_02 = findTLVField(id38Fields, '02');
    if (id38_02 && (id38_02.value === 'QRIBFTTA' || id38_02.value === 'QRIBFTTC')) {
      extracted.serviceCode = id38_02.value;
    }
  }

  // ID53: Currency
  const id53 = findTLVField(rootFields, '53');
  if (id53) extracted.currency = id53.value;

  // ID54: Amount
  const id54 = findTLVField(rootFields, '54');
  if (id54) extracted.amount = id54.value;

  // ID58: Country
  const id58 = findTLVField(rootFields, '58');
  if (id58) extracted.countryCode = id58.value;

  // ID62: Additional Data
  const id62 = findTLVField(rootFields, '62');
  if (id62) {
    const id62Fields = decodeNestedTLV(id62.value);
    extracted.additionalData = {};
    id62Fields.forEach((sf) => {
      extracted.additionalData![sf.id] = sf.value;
    });
  }

  return {
    raw: payload,
    fields,
    extracted,
  };
}

/**
 * Validate parsed VietQR
 */
export function validateVietQR(parsed: ParsedVietQR): ValidationReport {
  const issues: ValidationIssue[] = [];
  let crcValid = false;

  // Check CRC
  try {
    const payloadWithoutCRC = parsed.raw.slice(0, -4);
    const providedCRC = parsed.raw.slice(-4);
    const calculatedCRC = crc16ccittFalse(payloadWithoutCRC);
    crcValid = providedCRC.toUpperCase() === calculatedCRC.toUpperCase();

    if (!crcValid) {
      issues.push({
        level: 'error',
        field: '63',
        message: `CRC mismatch: expected ${calculatedCRC}, got ${providedCRC}`,
        suggestion: `Recalculate CRC with correct algorithm`,
      });
    }
  } catch (error) {
    issues.push({
      level: 'error',
      field: '63',
      message: 'Failed to validate CRC: ' + (error as Error).message,
    });
  }

  // ID00: Must be "01"
  if (parsed.extracted.initiationMethod === undefined) {
    const id00Field = parsed.fields.find((f) => f.id === '00');
    if (!id00Field) {
      issues.push({
        level: 'error',
        field: '00',
        message: 'Missing Payload Format Indicator (ID00)',
        suggestion: 'Add ID00 with value "01"',
      });
    } else if (id00Field.value !== '01') {
      issues.push({
        level: 'error',
        field: '00',
        message: `Invalid Payload Format Indicator: "${id00Field.value}" (must be "01")`,
        suggestion: 'Set ID00 to "01"',
      });
    }
  }

  // ID01: Must be "11" or "12"
  if (!parsed.extracted.initiationMethod) {
    issues.push({
      level: 'error',
      field: '01',
      message: 'Missing or invalid Point of Initiation Method (ID01)',
      suggestion: 'Set ID01 to "11" (static) or "12" (dynamic)',
    });
  }

  // ID38: Must have valid AID and structure
  const id38Field = parsed.fields.find((f) => f.id === '38');
  if (!id38Field) {
    issues.push({
      level: 'error',
      field: '38',
      message: 'Missing Merchant Account Information (ID38)',
      suggestion: 'Add ID38 with NAPAS AID and account details',
    });
  } else {
    const aid = id38Field.subFields?.find((sf) => sf.id === '00');
    if (!aid || aid.value !== NAPAS_AID) {
      issues.push({
        level: 'error',
        field: '38.00',
        message: `Invalid or missing AID (must be "${NAPAS_AID}")`,
        suggestion: `Set ID38.00 to "${NAPAS_AID}"`,
      });
    }

    const bnbAccount = id38Field.subFields?.find((sf) => sf.id === '01');
    if (!bnbAccount) {
      issues.push({
        level: 'error',
        field: '38.01',
        message: 'Missing BNB and Account ID',
        suggestion: 'Add ID38.01 with 6-digit BNB + Account ID',
      });
    } else {
      if (bnbAccount.value.length < 6) {
        issues.push({
          level: 'error',
          field: '38.01',
          message: 'BNB ID must be at least 6 characters',
          suggestion: 'Ensure first 6 characters are valid BNB code',
        });
      }
      if (bnbAccount.value.length > 25) {
        issues.push({
          level: 'error',
          field: '38.01',
          message: 'BNB + Account ID exceeds maximum length (6 + 19 = 25)',
          suggestion: 'Account ID must be max 19 characters',
        });
      }
    }

    const serviceCode = id38Field.subFields?.find((sf) => sf.id === '02');
    if (!serviceCode) {
      issues.push({
        level: 'error',
        field: '38.02',
        message: 'Missing Service Code',
        suggestion: 'Add ID38.02 with "QRIBFTTA" or "QRIBFTTC"',
      });
    } else if (serviceCode.value !== 'QRIBFTTA' && serviceCode.value !== 'QRIBFTTC') {
      issues.push({
        level: 'error',
        field: '38.02',
        message: `Invalid Service Code: "${serviceCode.value}"`,
        suggestion: 'Must be "QRIBFTTA" (account) or "QRIBFTTC" (card)',
      });
    }
  }

  // ID53: Currency (mandatory)
  if (!parsed.extracted.currency) {
    issues.push({
      level: 'error',
      field: '53',
      message: 'Missing Transaction Currency (ID53)',
      suggestion: 'Add ID53 with ISO 4217 code (e.g., "704" for VND)',
    });
  }

  // ID54: Amount (validate format if present)
  if (parsed.extracted.amount) {
    if (!/^\d+(\.\d+)?$/.test(parsed.extracted.amount)) {
      issues.push({
        level: 'error',
        field: '54',
        message: `Invalid amount format: "${parsed.extracted.amount}"`,
        suggestion: 'Amount must be numeric with optional decimal point',
      });
    }
  } else if (parsed.extracted.initiationMethod === '12') {
    issues.push({
      level: 'warning',
      field: '54',
      message: 'Dynamic QR (ID01=12) typically includes amount',
      suggestion: 'Consider adding ID54 for dynamic QR',
    });
  }

  // ID58: Country Code (mandatory)
  if (!parsed.extracted.countryCode) {
    issues.push({
      level: 'error',
      field: '58',
      message: 'Missing Country Code (ID58)',
      suggestion: 'Add ID58 with ISO 3166-1 alpha-2 code (e.g., "VN")',
    });
  }

  const isValid = issues.filter((i) => i.level === 'error').length === 0 && crcValid;

  return {
    isValid,
    crcValid,
    issues,
  };
}
