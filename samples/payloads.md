# VietQR Sample Payloads

## Sample 1: Static QR to Account

**Payload:**
```
00020101021138570010A00000072701270006970403011200110123456780208QRIBFTTA53037045802VN6304F4E5
```

**Details:**
- Type: Static (ID01=11)
- Service: QRIBFTTA (To Account)
- BNB: 970403
- Account: 0112001101234567890
- Currency: 704 (VND)
- Country: VN
- CRC: F4E5

---

## Sample 2: Static QR to Card

**Payload:**
```
00020101021138600010A00000072701300006970403011697040311012345670208QRIBFTTC53037045802VN63044F52
```

**Details:**
- Type: Static (ID01=11)
- Service: QRIBFTTC (To Card)
- BNB: 970403
- Card: 0116970403110123456790
- Currency: 704 (VND)
- Country: VN
- CRC: 4F52

---

## Sample 3: Dynamic QR with Amount and Additional Data

**Payload:**
```
00020101021238570010A00000072701270006970403011300110123456780208QRIBFTTA530370454061800005802VN62340107NPS68690819thanh toan don hang63042E2E
```

**Details:**
- Type: Dynamic (ID01=12)
- Service: QRIBFTTA (To Account)
- BNB: 970403
- Account: 0113001101234567890
- Amount: 180000 VND
- Currency: 704 (VND)
- Country: VN
- Additional Data:
  - Bill Number (ID62.01): NPS6869
  - Purpose (ID62.08): thanh toan don hang
- CRC: 2E2E

---

## How to Use

1. **Generate Tab**:
   - Enter the details above to recreate these payloads
   - Compare the generated CRC with the expected CRC

2. **Decode Tab**:
   - Paste any of these payloads into the text area
   - Click "Decode" to see the parsed fields
   - Verify that validation passes with green checkmarks

3. **Testing**:
   - All payloads should pass CRC validation
   - All payloads should be marked as valid QR codes
   - Field parsing should match the details listed above
