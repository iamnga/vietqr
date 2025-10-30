import { describe, it, expect } from 'vitest';
import { parseVietQR, validateVietQR, buildVietQR } from '../vietqr';
import type { VietQRFormData } from '../vietqr-types';

describe('VietQR Real-World Tests', () => {
  it('should parse real valid VietQR payload from user', async () => {
    const realPayload = '00020101021238540010A00000072701240006970448011003494444400208QRIBFTTA530370454065000005802VN62400308CUAHANG10708DIEMBAN10812XIN CHAO BAN63040936';

    const parsed = await parseVietQR(realPayload);

    console.log('Parsed:', JSON.stringify(parsed.extracted, null, 2));

    // Expected values
    expect(parsed.extracted.initiationMethod).toBe('12'); // Dynamic
    expect(parsed.extracted.bnbId).toBe('970448'); // Bank BIN
    expect(parsed.extracted.accountId).toBe('0349444440'); // Account number
    expect(parsed.extracted.serviceCode).toBe('QRIBFTTA'); // To account
    expect(parsed.extracted.currency).toBe('704'); // VND
    expect(parsed.extracted.amount).toBe('500000'); // Amount
    expect(parsed.extracted.countryCode).toBe('VN');

    // Additional data
    expect(parsed.extracted.additionalData?.['03']).toBe('CUAHANG1'); // Store label
    expect(parsed.extracted.additionalData?.['07']).toBe('DIEMBAN1'); // Terminal
    expect(parsed.extracted.additionalData?.['08']).toBe('XIN CHAO BAN'); // Purpose

    // Validate
    const validation = validateVietQR(parsed);
    expect(validation.crcValid).toBe(true);
    expect(validation.isValid).toBe(true);
  });

  it('should generate VietQR that matches real-world structure', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12',
      serviceCode: 'QRIBFTTA',
      bnbId: '970448',
      accountId: '0349444440',
      amount: '500000',
      currency: '704',
      countryCode: 'VN',
      additionalData: {
        storeLabel: 'CUAHANG1',
        terminalLabel: 'DIEMBAN1',
        purposeOfTransaction: 'XIN CHAO BAN',
      },
    };

    const generated = await buildVietQR(formData);

    console.log('Generated payload:', generated.payload);

    // Parse it back
    const parsed = await parseVietQR(generated.payload);

    // Verify all data is correct
    expect(parsed.extracted.initiationMethod).toBe('12');
    expect(parsed.extracted.bnbId).toBe('970448');
    expect(parsed.extracted.accountId).toBe('0349444440');
    expect(parsed.extracted.serviceCode).toBe('QRIBFTTA');
    expect(parsed.extracted.amount).toBe('500000');

    // Validate
    const validation = validateVietQR(parsed);
    expect(validation.crcValid).toBe(true);
    expect(validation.isValid).toBe(true);
  });

  it('should generate compatible QR for simple account transfer', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '11', // Static
      serviceCode: 'QRIBFTTA',
      bnbId: '970415', // Vietinbank
      accountId: '113366668888',
      currency: '704',
      countryCode: 'VN',
    };

    const generated = await buildVietQR(formData);
    const parsed = await parseVietQR(generated.payload);
    const validation = validateVietQR(parsed);

    console.log('Validation:', JSON.stringify(validation, null, 2));

    expect(validation.isValid).toBe(true);
    expect(validation.crcValid).toBe(true);

    // Verify structure
    expect(parsed.extracted.bnbId).toBe('970415');
    expect(parsed.extracted.accountId).toBe('113366668888');
  });
});
