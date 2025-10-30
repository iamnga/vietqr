/**
 * TLV (Tag-Length-Value) Encoder/Decoder for VietQR
 *
 * Format: ID(2 digits) + Length(2 digits) + Value(variable)
 * Example: "0002" + "01" = ID=00, Length=02, Value="01"
 */

export interface TLVField {
  id: string;
  length: number;
  value: string;
}

export class TLVError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TLVError';
  }
}

/**
 * Encode a single TLV field
 */
export function encodeTLVField(id: string, value: string): string {
  // Validate ID (must be 2 digits)
  if (!/^\d{2}$/.test(id)) {
    throw new TLVError(`Invalid ID: "${id}". Must be 2 digits.`);
  }

  // Calculate length
  const length = value.length;

  // Validate length (must fit in 2 digits: 00-99)
  if (length > 99) {
    throw new TLVError(
      `Value too long for ID ${id}: ${length} characters (max 99)`
    );
  }

  // Format: ID(2) + Length(2) + Value
  return id + length.toString().padStart(2, '0') + value;
}

/**
 * Encode multiple TLV fields
 */
export function encodeTLV(fields: Array<{ id: string; value: string }>): string {
  return fields.map(({ id, value }) => encodeTLVField(id, value)).join('');
}

/**
 * Decode TLV payload into individual fields
 */
export function decodeTLV(payload: string): TLVField[] {
  const fields: TLVField[] = [];
  let position = 0;

  while (position < payload.length) {
    // Need at least 4 characters for ID + Length
    if (position + 4 > payload.length) {
      throw new TLVError(
        `Incomplete TLV at position ${position}: not enough data for ID and Length`
      );
    }

    // Extract ID (2 chars)
    const id = payload.substring(position, position + 2);
    if (!/^\d{2}$/.test(id)) {
      throw new TLVError(`Invalid ID at position ${position}: "${id}"`);
    }
    position += 2;

    // Extract Length (2 chars)
    const lengthStr = payload.substring(position, position + 2);
    if (!/^\d{2}$/.test(lengthStr)) {
      throw new TLVError(`Invalid length at position ${position}: "${lengthStr}"`);
    }
    const length = parseInt(lengthStr, 10);
    position += 2;

    // Extract Value
    if (position + length > payload.length) {
      throw new TLVError(
        `Incomplete value for ID ${id} at position ${position}: expected ${length} chars, only ${payload.length - position} available`
      );
    }
    const value = payload.substring(position, position + length);
    position += length;

    fields.push({ id, length, value });
  }

  return fields;
}

/**
 * Find a specific field by ID in decoded TLV
 */
export function findTLVField(fields: TLVField[], id: string): TLVField | undefined {
  return fields.find((field) => field.id === id);
}

/**
 * Get field value by ID (returns undefined if not found)
 */
export function getTLVValue(fields: TLVField[], id: string): string | undefined {
  return findTLVField(fields, id)?.value;
}

/**
 * Decode nested TLV (for ID62, ID38, etc.)
 */
export function decodeNestedTLV(value: string): TLVField[] {
  try {
    return decodeTLV(value);
  } catch (error) {
    // If nested decode fails, return empty array
    return [];
  }
}
