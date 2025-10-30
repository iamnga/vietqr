import { describe, it, expect } from 'vitest';
import { buildVietQR, parseVietQR, validateVietQR } from '../vietqr';
import type { VietQRFormData } from '../vietqr-types';

describe('VietQR Builder', () => {
  it('should build static QR to account', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '11',
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '0112001101234567890',
      currency: '704',
      countryCode: 'VN',
    };

    const result = await buildVietQR(formData);

    expect(result.payload).toContain('000201'); // ID00=01
    expect(result.payload).toContain('010211'); // ID01=11
    expect(result.payload).toContain('A000000727'); // NAPAS AID
    expect(result.payload).toContain('970403'); // BNB
    expect(result.payload).toContain('QRIBFTTA'); // Service code
    expect(result.payload).toContain('5303704'); // Currency VND
    expect(result.payload).toContain('5802VN'); // Country
    expect(result.crc).toHaveLength(4);
    expect(result.payload).toMatch(/6304[0-9A-F]{4}$/); // Ends with CRC
    expect(result.svg).toContain('<svg');
    expect(result.pngDataUrl).toContain('data:image/png');
  });

  it('should build dynamic QR with amount', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12',
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '0113001101234567890',
      amount: '180000',
      currency: '704',
      countryCode: 'VN',
    };

    const result = await buildVietQR(formData);

    expect(result.payload).toContain('010212'); // ID01=12
    expect(result.payload).toContain('5406180000'); // Amount
  });

  it('should build QR with additional data', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12',
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '0113001101234567890',
      amount: '180000',
      additionalData: {
        billNumber: 'NPS6869',
        purposeOfTransaction: 'thanh toan don hang',
      },
    };

    const result = await buildVietQR(formData);

    expect(result.payload).toContain('62'); // ID62 present
    expect(result.payload).toContain('NPS6869');
    expect(result.payload).toContain('thanh toan don hang');
  });

  it('should validate BNB ID', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '11',
      serviceCode: 'QRIBFTTA',
      bnbId: '12345', // Invalid: only 5 digits
      accountId: '123',
    };

    await expect(buildVietQR(formData)).rejects.toThrow('BNB ID must be exactly 6 digits');
  });

  it('should validate account ID length', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '11',
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '12345678901234567890', // 20 chars, exceeds 19
    };

    await expect(buildVietQR(formData)).rejects.toThrow('Account ID must be max 19 characters');
  });

  it('should validate amount format', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12',
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '123',
      amount: '1,000.50', // Invalid: contains comma
    };

    await expect(buildVietQR(formData)).rejects.toThrow('Amount must be numeric');
  });

  it('should accept valid decimal amount', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12',
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '123',
      amount: '1000.50',
    };

    const result = await buildVietQR(formData);
    expect(result.payload).toContain('54071000.50');
  });
});

describe('VietQR Parser', () => {
  it('should parse static QR to account', async () => {
    const payload = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304F4E5';
    const parsed = await parseVietQR(payload);

    expect(parsed.raw).toBe(payload);
    expect(parsed.extracted.initiationMethod).toBe('11');
    expect(parsed.extracted.serviceCode).toBe('QRIBFTTA');
    expect(parsed.extracted.bnbId).toBe('970403');
    expect(parsed.extracted.accountId).toBe('011200110123456780');
    expect(parsed.extracted.currency).toBe('704');
    expect(parsed.extracted.countryCode).toBe('VN');
  });

  it('should parse dynamic QR with amount and additional data', async () => {
    const payload = '00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang63042E2E';
    const parsed = await parseVietQR(payload);

    expect(parsed.extracted.initiationMethod).toBe('12');
    expect(parsed.extracted.amount).toBe('180000');
    expect(parsed.extracted.additionalData).toBeDefined();
    expect(parsed.extracted.additionalData?.['01']).toBe('NPS6869');
    expect(parsed.extracted.additionalData?.['08']).toBe('thanh toan don hang');
  });

  it('should parse field names correctly', async () => {
    const payload = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304F4E5';
    const parsed = await parseVietQR(payload);

    const id00 = parsed.fields.find((f) => f.id === '00');
    expect(id00?.name).toBe('Payload Format Indicator');

    const id01 = parsed.fields.find((f) => f.id === '01');
    expect(id01?.name).toBe('Point of Initiation Method');

    const id38 = parsed.fields.find((f) => f.id === '38');
    expect(id38?.name).toBe('Merchant Account Information (VietQR)');
    expect(id38?.subFields).toHaveLength(3);
  });
});

describe('VietQR Validator', () => {
  it('should validate correct static QR', async () => {
    const payload = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304F4E5';
    const parsed = await parseVietQR(payload);
    const validation = validateVietQR(parsed);

    expect(validation.isValid).toBe(true);
    expect(validation.crcValid).toBe(true);
    expect(validation.issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('should detect invalid CRC', async () => {
    const payload = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN63040000';
    const parsed = await parseVietQR(payload);
    const validation = validateVietQR(parsed);

    expect(validation.crcValid).toBe(false);
    expect(validation.isValid).toBe(false);
    expect(validation.issues.some((i) => i.field === '63')).toBe(true);
  });

  it('should detect missing mandatory fields', async () => {
    // Missing ID53 (currency)
    const payload = '000201010211013857A00000072701270006970403011200110123456780208QRIBFTTA5802VN6304XXXX';

    // Parse will work, but validation should catch it
    const parsed = await parseVietQR(payload);
    const validation = validateVietQR(parsed);

    expect(validation.isValid).toBe(false);
    expect(validation.issues.some((i) => i.field === '53')).toBe(true);
  });

  it('should validate service code', async () => {
    // Build a payload with invalid service code and manually replace it
    const formData: VietQRFormData = {
      initiationMethod: '11',
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '123',
    };

    const result = await buildVietQR(formData);
    // Manually corrupt service code
    const corruptedPayload = result.payload.replace('QRIBFTTA', 'INVALID!');

    const parsed = await parseVietQR(corruptedPayload);
    const validation = validateVietQR(parsed);

    expect(validation.issues.some((i) => i.field === '38.02')).toBe(true);
  });

  it('should warn about missing amount in dynamic QR', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12', // Dynamic
      serviceCode: 'QRIBFTTA',
      bnbId: '970403',
      accountId: '123',
      // No amount
    };

    const result = await buildVietQR(formData);
    const parsed = await parseVietQR(result.payload);
    const validation = validateVietQR(parsed);

    expect(validation.issues.some((i) => i.field === '54' && i.level === 'warning')).toBe(true);
  });
});

describe('Round-trip test', () => {
  it('should maintain data integrity through build-parse cycle', async () => {
    const formData: VietQRFormData = {
      initiationMethod: '12',
      serviceCode: 'QRIBFTTC',
      bnbId: '970407',
      accountId: '1234567890123',
      amount: '50000.50',
      currency: '704',
      countryCode: 'VN',
      additionalData: {
        billNumber: 'BILL123',
        purposeOfTransaction: 'Payment for services',
      },
    };

    const generated = await buildVietQR(formData);
    const parsed = await parseVietQR(generated.payload);
    const validation = validateVietQR(parsed);

    expect(validation.isValid).toBe(true);
    expect(parsed.extracted.initiationMethod).toBe(formData.initiationMethod);
    expect(parsed.extracted.serviceCode).toBe(formData.serviceCode);
    expect(parsed.extracted.bnbId).toBe(formData.bnbId);
    expect(parsed.extracted.accountId).toBe(formData.accountId);
    expect(parsed.extracted.amount).toBe(formData.amount);
    expect(parsed.extracted.currency).toBe(formData.currency);
    expect(parsed.extracted.countryCode).toBe(formData.countryCode);
  });
});
