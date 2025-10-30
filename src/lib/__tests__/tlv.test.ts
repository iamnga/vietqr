import { describe, it, expect } from 'vitest';
import {
  encodeTLVField,
  encodeTLV,
  decodeTLV,
  findTLVField,
  getTLVValue,
  TLVError,
} from '../tlv';

describe('TLV Encoder', () => {
  it('should encode simple TLV field', () => {
    expect(encodeTLVField('00', '01')).toBe('000201');
    expect(encodeTLVField('01', '11')).toBe('010211');
    expect(encodeTLVField('53', '704')).toBe('5303704');
  });

  it('should handle empty value', () => {
    expect(encodeTLVField('99', '')).toBe('9900');
  });

  it('should pad length to 2 digits', () => {
    expect(encodeTLVField('58', 'VN')).toBe('5802VN');
    expect(encodeTLVField('54', '123456789')).toBe('5409123456789');
  });

  it('should throw error for invalid ID', () => {
    expect(() => encodeTLVField('1', 'value')).toThrow(TLVError);
    expect(() => encodeTLVField('ABC', 'value')).toThrow(TLVError);
    expect(() => encodeTLVField('', 'value')).toThrow(TLVError);
  });

  it('should throw error for value too long', () => {
    const longValue = 'x'.repeat(100);
    expect(() => encodeTLVField('00', longValue)).toThrow(TLVError);
  });

  it('should encode multiple TLV fields', () => {
    const result = encodeTLV([
      { id: '00', value: '01' },
      { id: '01', value: '11' },
      { id: '58', value: 'VN' },
    ]);
    expect(result).toBe('0002010102115802VN');
  });
});

describe('TLV Decoder', () => {
  it('should decode simple TLV', () => {
    const fields = decodeTLV('000201');
    expect(fields).toEqual([{ id: '00', length: 2, value: '01' }]);
  });

  it('should decode multiple TLV fields', () => {
    const fields = decodeTLV('0002010102115802VN');
    expect(fields).toEqual([
      { id: '00', length: 2, value: '01' },
      { id: '01', length: 2, value: '11' },
      { id: '58', length: 2, value: 'VN' },
    ]);
  });

  it('should decode nested TLV (ID38)', () => {
    const payload = '38570010A00000072701270006970403011200110123456780208QRIBFTTA';
    const fields = decodeTLV(payload);
    expect(fields).toHaveLength(1);
    expect(fields[0].id).toBe('38');
    expect(fields[0].length).toBe(57);

    // Decode nested
    const nested = decodeTLV(fields[0].value);
    expect(nested).toHaveLength(3);
    expect(nested[0]).toEqual({ id: '00', length: 10, value: 'A000000727' });
    expect(nested[1]).toEqual({ id: '01', length: 27, value: '000697040301120011012345678' });
    expect(nested[2]).toEqual({ id: '02', length: 8, value: 'QRIBFTTA' });
  });

  it('should throw error for incomplete TLV', () => {
    expect(() => decodeTLV('00')).toThrow(TLVError);
    expect(() => decodeTLV('000')).toThrow(TLVError);
    expect(() => decodeTLV('00020')).toThrow(TLVError);
  });

  it('should throw error for invalid ID', () => {
    expect(() => decodeTLV('XX0201')).toThrow(TLVError);
  });

  it('should throw error for invalid length', () => {
    expect(() => decodeTLV('00XX01')).toThrow(TLVError);
  });

  it('should handle empty payload', () => {
    const fields = decodeTLV('');
    expect(fields).toEqual([]);
  });
});

describe('TLV Helpers', () => {
  const fields = [
    { id: '00', length: 2, value: '01' },
    { id: '01', length: 2, value: '11' },
    { id: '53', length: 3, value: '704' },
  ];

  it('should find TLV field by ID', () => {
    const field = findTLVField(fields, '01');
    expect(field).toEqual({ id: '01', length: 2, value: '11' });
  });

  it('should return undefined for non-existent ID', () => {
    const field = findTLVField(fields, '99');
    expect(field).toBeUndefined();
  });

  it('should get TLV value by ID', () => {
    expect(getTLVValue(fields, '53')).toBe('704');
    expect(getTLVValue(fields, '00')).toBe('01');
  });

  it('should return undefined for non-existent value', () => {
    expect(getTLVValue(fields, '99')).toBeUndefined();
  });
});

describe('Real VietQR Payloads', () => {
  it('should decode sample static QR to account', () => {
    const payload = '00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304F4E5';
    const fields = decodeTLV(payload);

    expect(findTLVField(fields, '00')?.value).toBe('01');
    expect(findTLVField(fields, '01')?.value).toBe('11');
    expect(findTLVField(fields, '53')?.value).toBe('704');
    expect(findTLVField(fields, '58')?.value).toBe('VN');
    expect(findTLVField(fields, '63')?.value).toBe('F4E5');
  });

  it('should decode sample dynamic QR with amount', () => {
    const payload = '00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang6304E2E2';
    const fields = decodeTLV(payload);

    expect(findTLVField(fields, '01')?.value).toBe('12');
    expect(findTLVField(fields, '54')?.value).toBe('180000');
    expect(findTLVField(fields, '62')).toBeDefined();
  });
});
