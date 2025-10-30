# VietQR Research Tool

> **⚠️ IMPORTANT: For POC/Educational Purposes Only**
>
> This tool is designed for research and learning purposes ONLY. DO NOT use it for real financial transactions or to collect actual payments. This is a proof-of-concept implementation to understand VietQR specifications.

## Overview

VietQR Research Tool is a web-based application for generating and decoding VietQR codes according to the VietQR/NAPAS specifications. It provides a hands-on way to learn about the VietQR format, TLV encoding, and QR code structure.

### Features

- **Generate VietQR Codes**
  - Static QR (ID01=11) and Dynamic QR (ID01=12)
  - Support for both account transfers (QRIBFTTA) and card transfers (QRIBFTTC)
  - Configurable BNB (Bank BIN), account/card numbers, amounts, and additional data
  - Automatic CRC-16/CCITT-FALSE checksum calculation
  - Export QR as PNG or SVG

- **Decode & Validate VietQR**
  - Upload QR image or paste payload text
  - Parse TLV structure and display all fields
  - Validate against VietQR specifications
  - CRC verification with detailed error reporting
  - Field-by-field analysis with nested sub-fields (ID38, ID62)

- **User Experience**
  - Responsive design (mobile-friendly)
  - Dark/Light mode with system preference detection
  - Vietnamese/English language support
  - Accessible UI with ARIA labels and keyboard navigation
  - Real-time validation with helpful error messages

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **QR Generation**: qrcode
- **QR Decoding**: @zxing/browser
- **Validation**: Zod
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use `nvm`)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vietqr

# Install dependencies
pnpm install
# or: npm install
```

### Development

```bash
# Start development server
pnpm dev
# or: npm run dev

# Open http://localhost:5173 in your browser
```

### Build

```bash
# Build for production
pnpm build
# or: npm run build

# Preview production build
pnpm preview
# or: npm run preview
```

### Testing

```bash
# Run unit tests
pnpm test
# or: npm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## Project Structure

```
vietqr/
├── src/
│   ├── components/         # React components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Tabs.tsx
│   │   ├── Header.tsx
│   │   ├── GenerateQR.tsx  # QR generation UI
│   │   └── DecodeQR.tsx    # QR decoding UI
│   ├── contexts/
│   │   └── AppContext.tsx  # Theme & i18n context
│   ├── i18n/
│   │   └── translations.ts # VN/EN translations
│   ├── lib/
│   │   ├── crc16.ts        # CRC-16/CCITT-FALSE implementation
│   │   ├── tlv.ts          # TLV encoder/decoder
│   │   ├── vietqr.ts       # VietQR core logic
│   │   ├── vietqr-types.ts # TypeScript types
│   │   └── __tests__/      # Unit tests
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── samples/
│   └── payloads.md         # Sample VietQR payloads
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## VietQR Specifications

### TLV Format

VietQR uses Tag-Length-Value (TLV) encoding:
- **Tag (ID)**: 2 digits (00-99)
- **Length**: 2 digits (00-99)
- **Value**: Variable length string

Example: `000201` → ID=00, Length=02, Value="01"

### Key Fields

| ID | Name | Description |
|----|------|-------------|
| 00 | Payload Format Indicator | Always "01" |
| 01 | Point of Initiation Method | "11" (static) or "12" (dynamic) |
| 38 | Merchant Account Information | VietQR via NAPAS (contains nested TLV) |
| 53 | Transaction Currency | ISO 4217 (704 = VND) |
| 54 | Transaction Amount | Numeric string (optional for static) |
| 58 | Country Code | ISO 3166-1 alpha-2 (VN) |
| 62 | Additional Data Template | Optional nested TLV for metadata |
| 63 | CRC | CRC-16/CCITT-FALSE checksum |

### ID38 Sub-fields (VietQR)

| ID | Name | Description |
|----|------|-------------|
| 00 | AID | Application Identifier: "A000000727" (NAPAS) |
| 01 | Beneficiary Organization | 6-digit BNB + Account/Card ID (max 19 chars) |
| 02 | Service Code | "QRIBFTTA" (account) or "QRIBFTTC" (card) |

### CRC Calculation

CRC-16/CCITT-FALSE algorithm:
- Polynomial: 0x1021
- Initial value: 0xFFFF
- No reflection (RefIn=false, RefOut=false)
- XorOut: 0x0000
- Input: Full payload up to "6304" (excluding CRC value itself)
- Output: 4 uppercase hex characters

## Sample Payloads

See [samples/payloads.md](./samples/payloads.md) for complete examples.

### Quick Test

**Static QR to Account:**
```
00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304F4E5
```

Paste this into the Decode tab to see it parsed and validated.

## Limitations & Disclaimers

1. **Educational Purpose Only**: This tool is for learning and research. Do not use for real transactions.

2. **No Backend**: All processing happens in the browser. No data is sent to any server.

3. **Spec Compliance**: Implementation is based on publicly available VietQR documentation. Always refer to official NAPAS specifications for production use.

4. **Testing Only**: QR codes generated here should not be used in production banking applications.

5. **No Warranty**: This software is provided "as is" without any warranties. Use at your own risk.

## Development Notes

### Changing Libraries

- **QR Generation**: Currently uses `qrcode`. Can be replaced with `qr-code-styling` or `react-qr-code` by updating `src/lib/vietqr.ts`

- **QR Decoding**: Currently uses `@zxing/browser`. Alternatives: `jsqr`, `qr-scanner`. Update `src/lib/vietqr.ts` accordingly.

- **Validation**: Uses Zod for schema validation. Can be replaced with Yup or Joi if needed.

### Adding New Fields

1. Update types in `src/lib/vietqr-types.ts`
2. Modify builder in `src/lib/vietqr.ts` (`buildVietQR`)
3. Update parser if needed (`parseVietQR`)
4. Add validation rules in `validateVietQR`
5. Update UI components to include new fields

## Contributing

This is a POC/educational project. If you find bugs or have suggestions:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Resources

- VietQR Specification: Based on QR_Format_T&C_v1.0_VN_092021.pdf
- NAPAS: https://www.napas.com.vn/
- EMVCo QR Code Specification
- ISO 4217 Currency Codes
- ISO 3166-1 Country Codes

## Acknowledgments

- NAPAS for VietQR specifications
- Vietnamese banking community
- Open-source libraries used in this project

---

**Remember**: This is a learning tool. For production implementations, always consult official documentation and work with certified payment providers.
