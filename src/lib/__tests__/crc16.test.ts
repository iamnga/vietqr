import { describe, it, expect } from 'vitest';
import { crc16ccittFalse, calculateVietQRCRC, verifyCRC } from '../crc16';

describe('CRC-16/CCITT-FALSE', () => {
  it('should calculate correct CRC for known test vectors', () => {
    // Test vector 1: "123456789"
    expect(crc16ccittFalse('123456789')).toBe('29B1');

    // Test vector 2: Empty string
    expect(crc16ccittFalse('')).toBe('FFFF');

    // Test vector 3: "A"
    expect(crc16ccittFalse('A')).toBe('538D');
  });

  it('should calculate correct CRC for VietQR sample payloads', () => {
    // Sample 1: Static to account
    const payload1 = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304';
    expect(calculateVietQRCRC(payload1)).toBe('F4E5');

    // Sample 2: Static to card
    const payload2 = '00020101021138600010A00000072701300006970403011697040311012345670208QRIBFTTC53037045802VN6304';
    expect(calculateVietQRCRC(payload2)).toBe('4F52');

    // Sample 3: Dynamic with amount
    const payload3 = '00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang6304';
    expect(calculateVietQRCRC(payload3)).toBe('2E2E');
  });

  it('should verify valid CRC', () => {
    const validPayload1 = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304F4E5';
    expect(verifyCRC(validPayload1)).toBe(true);

    const validPayload2 = '00020101021138600010A00000072701300006970403011697040311012345670208QRIBFTTC53037045802VN63044F52';
    expect(verifyCRC(validPayload2)).toBe(true);
  });

  it('should detect invalid CRC', () => {
    const invalidPayload = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN63040000';
    expect(verifyCRC(invalidPayload)).toBe(false);
  });

  it('should return uppercase hex', () => {
    const crc = crc16ccittFalse('test');
    expect(crc).toMatch(/^[0-9A-F]{4}$/);
  });

  it('should pad to 4 characters', () => {
    const crc = crc16ccittFalse('a');
    expect(crc).toHaveLength(4);
  });
});
