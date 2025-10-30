/**
 * CRC-16/CCITT-FALSE Implementation
 *
 * Polynomial: 0x1021
 * Initial value: 0xFFFF
 * XorOut: 0x0000
 * RefIn: false
 * RefOut: false
 *
 * Used for VietQR checksum calculation (ID63)
 */

/**
 * Calculate CRC-16/CCITT-FALSE checksum
 * @param data - Input string (ASCII payload up to "6304")
 * @returns 4-character uppercase hex string
 */
export function crc16ccittFalse(data: string): string {
  const polynomial = 0x1021;
  let crc = 0xFFFF;

  // Convert string to bytes
  const bytes = new TextEncoder().encode(data);

  for (const byte of bytes) {
    // XOR byte into CRC top byte
    crc ^= byte << 8;

    // Process each bit
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }

    // Keep it 16-bit
    crc &= 0xFFFF;
  }

  // Return as 4-digit uppercase hex
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Calculate CRC for a VietQR payload
 * The payload should end with "6304" (without the actual CRC value)
 */
export function calculateVietQRCRC(payloadWithoutCRC: string): string {
  // Ensure payload ends with "6304"
  const base = payloadWithoutCRC.endsWith('6304')
    ? payloadWithoutCRC
    : payloadWithoutCRC + '6304';

  return crc16ccittFalse(base);
}

/**
 * Verify CRC of a complete VietQR payload
 * @param payload - Complete payload including CRC (ID63)
 * @returns true if CRC is valid
 */
export function verifyCRC(payload: string): boolean {
  // Extract CRC from payload (last 4 characters)
  const providedCRC = payload.slice(-4).toUpperCase();

  // Calculate expected CRC (everything except the CRC value itself)
  const payloadWithoutCRC = payload.slice(0, -4);
  const calculatedCRC = crc16ccittFalse(payloadWithoutCRC);

  return providedCRC === calculatedCRC;
}
