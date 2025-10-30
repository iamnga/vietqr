import { describe, it, expect } from 'vitest';
import { buildVietQR, parseVietQR, validateVietQR } from '../vietqr';
import type { VietQRFormData } from '../vietqr-types';

describe('VietQR Integration Tests', () => {
  it('should generate and parse static QR to account', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '11',
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '1234567890',
      currency: '704',
      countryCode: 'VN',
    };

    // Generate
    const generated = await buildVietQR(formData);
    expect(generated.payload).toBeTruthy();
    expect(generated.crc).toHaveLength(4);
    expect(generated.payload).toMatch(/6304[0-9A-F]{4}$/);

    // Parse
    const parsed = await parseVietQR(generated.payload);
    expect(parsed.extracted.initiationMethod).toBe('11');
    expect(parsed.extracted.serviceCode).toBe('QRIBFTTA');
    expect(parsed.extracted.bnbId).toBe('970403');
    expect(parsed.extracted.accountId).toBe('1234567890');
    expect(parsed.extracted.currency).toBe('704');
    expect(parsed.extracted.countryCode).toBe('VN');

    // Validate
    const validation = validateVietQR(parsed);
    expect(validation.crcValid).toBe(true);
    expect(validation.isValid).toBe(true);
    expect(validation.issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('should generate and parse dynamic QR with amount', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12',
      serviceCode: 'QRIBFTTA',
      bnbId: '970407',
      accountId: '9876543210',
      amount: '50000',
      currency: '704',
      countryCode: 'VN',
    };

    const generated = await buildVietQR(formData);
    const parsed = await parseVietQR(generated.payload);
    const validation = validateVietQR(parsed);

    expect(parsed.extracted.initiationMethod).toBe('12');
    expect(parsed.extracted.amount).toBe('50000');
    expect(validation.isValid).toBe(true);
    expect(validation.crcValid).toBe(true);
  });

  it('should generate and parse QR with additional data', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12',
      serviceCode: 'QRIBFTTC',
      bnbId: '970415',
      accountId: '11111111',
      amount: '100000.50',
      additionalData: {
        billNumber: 'BILL123',
        purposeOfTransaction: 'Payment for services',
      },
    };

    const generated = await buildVietQR(formData);
    const parsed = await parseVietQR(generated.payload);
    const validation = validateVietQR(parsed);

    expect(parsed.extracted.serviceCode).toBe('QRIBFTTC');
    expect(parsed.extracted.amount).toBe('100000.50');
    expect(parsed.extracted.additionalData?.['01']).toBe('BILL123');
    expect(parsed.extracted.additionalData?.['08']).toBe('Payment for services');
    expect(validation.isValid).toBe(true);
  });

  it('should maintain data integrity through multiple cycles', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '11',
      serviceCode: 'QRIBFTTA',
      bnbId: '970422',
      accountId: 'TEST123',
      currency: '704',
      countryCode: 'VN',
    };

    // Generate
    const generated1 = await buildVietQR(formData);

    // Parse
    const parsed1 = await parseVietQR(generated1.payload);

    // Generate again from parsed data
    const formData2: VietQRFormData = {
      initiationMethod: parsed1.extracted.initiationMethod!,
      serviceCode: parsed1.extracted.serviceCode!,
      bnbId: parsed1.extracted.bnbId!,
      accountId: parsed1.extracted.accountId!,
      currency: parsed1.extracted.currency,
      countryCode: parsed1.extracted.countryCode,
    };
    const generated2 = await buildVietQR(formData2);

    // Should generate same payload
    expect(generated2.payload).toBe(generated1.payload);
  });
});
