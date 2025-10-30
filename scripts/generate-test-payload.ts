/**
 * Generate test payloads with correct nested TLV structure
 */
import { buildVietQR } from '../src/lib/vietqr.js';

async function main() {
  // Static QR to account
  const static1 = await buildVietQR({
    initiationMethod: '11',
    serviceCode: 'QRIBFTTA',
    bnbId: '970403',
    accountId: '011200110123456780',
    currency: '704',
    countryCode: 'VN',
  });

  console.log('Static QR to account:');
  console.log(static1.payload);
  console.log('');

  // Dynamic QR with amount and additional data
  const dynamic1 = await buildVietQR({
    initiationMethod: '12',
    serviceCode: 'QRIBFTTA',
    bnbId: '970403',
    accountId: '0113001101234567890',
    amount: '180000',
    currency: '704',
    countryCode: 'VN',
    additionalData: {
      billNumber: 'NPS6869',
      purposeOfTransaction: 'thanh toan don hang',
    },
  });

  console.log('Dynamic QR with amount and additional data:');
  console.log(dynamic1.payload);
}

main();
