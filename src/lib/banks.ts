/**
 * Vietnam Bank BIN Codes
 * Source: State Bank of Vietnam & VietQR
 */

export interface BankInfo {
  bin: string;
  shortName: string;
  fullName: string;
  logo?: string;
}

export const VIETNAM_BANKS: BankInfo[] = [
  // Top tier banks
  { bin: '970415', shortName: 'VietinBank', fullName: 'Ngân hàng TMCP Công Thương Việt Nam' },
  { bin: '970436', shortName: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
  { bin: '970418', shortName: 'BIDV', fullName: 'Ngân hàng TMCP Đầu Tư và Phát Triển Việt Nam' },
  { bin: '970405', shortName: 'Agribank', fullName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
  { bin: '970407', shortName: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ Thương Việt Nam' },
  { bin: '970422', shortName: 'MB', fullName: 'Ngân hàng TMCP Quân Đội' },
  { bin: '970423', shortName: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong' },
  { bin: '970403', shortName: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
  { bin: '970416', shortName: 'ACB', fullName: 'Ngân hàng TMCP Á Châu' },
  { bin: '970448', shortName: 'OCB', fullName: 'Ngân hàng TMCP Phương Đông' },

  // Other major banks
  { bin: '970406', shortName: 'DongA Bank', fullName: 'Ngân hàng TMCP Đông Á' },
  { bin: '970408', shortName: 'GPBank', fullName: 'Ngân hàng TMCP Dầu Khí Toàn Cầu' },
  { bin: '970409', shortName: 'BacA Bank', fullName: 'Ngân hàng TMCP Bắc Á' },
  { bin: '970410', shortName: 'SCB', fullName: 'Ngân hàng TMCP Sài Gòn' },
  { bin: '970412', shortName: 'PVcomBank', fullName: 'Ngân hàng TMCP Đại Chúng Việt Nam' },
  { bin: '970414', shortName: 'OceanBank', fullName: 'Ngân hàng TMCP Đại Dương' },
  { bin: '970419', shortName: 'NCB', fullName: 'Ngân hàng TMCP Quốc Dân' },
  { bin: '970421', shortName: 'VRB', fullName: 'Ngân hàng Liên Doanh Việt Nga' },
  { bin: '970424', shortName: 'ShinhanBank', fullName: 'Ngân hàng TNHH MTV Shinhan Việt Nam' },
  { bin: '970425', shortName: 'ABBank', fullName: 'Ngân hàng TMCP An Bình' },
  { bin: '970426', shortName: 'MSB', fullName: 'Ngân hàng TMCP Hàng Hải' },
  { bin: '970427', shortName: 'VIB', fullName: 'Ngân hàng TMCP Quốc Tế' },
  { bin: '970428', shortName: 'NAB', fullName: 'Ngân hàng TMCP Nam Á' },
  { bin: '970429', shortName: 'SCB', fullName: 'Ngân hàng TMCP Sài Gòn' },
  { bin: '970430', shortName: 'PGBank', fullName: 'Ngân hàng TMCP Xăng Dầu Petrolimex' },
  { bin: '970431', shortName: 'Eximbank', fullName: 'Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam' },
  { bin: '970432', shortName: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
  { bin: '970433', shortName: 'VietBank', fullName: 'Ngân hàng TMCP Việt Nam Thương Tín' },
  { bin: '970437', shortName: 'HDBank', fullName: 'Ngân hàng TMCP Phát Triển TP.HCM' },
  { bin: '970438', shortName: 'BVBank', fullName: 'Ngân hàng TMCP Bảo Việt' },
  { bin: '970439', shortName: 'PublicBank', fullName: 'Ngân hàng TNHH MTV Public Việt Nam' },
  { bin: '970440', shortName: 'SeABank', fullName: 'Ngân hàng TMCP Đông Nam Á' },
  { bin: '970441', shortName: 'VietCapital', fullName: 'Ngân hàng TMCP Bản Việt' },
  { bin: '970442', shortName: 'BanViet', fullName: 'Ngân hàng TMCP Bản Việt' },
  { bin: '970443', shortName: 'SHB', fullName: 'Ngân hàng TMCP Sài Gòn - Hà Nội' },
  { bin: '970444', shortName: 'CBBank', fullName: 'Ngân hàng TMCP Xây Dựng Việt Nam' },
  { bin: '970446', shortName: 'COOPBANK', fullName: 'Ngân hàng Hợp Tác xã Việt Nam' },
  { bin: '970449', shortName: 'LienVietPostBank', fullName: 'Ngân hàng TMCP Bưu Điện Liên Việt' },
  { bin: '970452', shortName: 'KienLongBank', fullName: 'Ngân hàng TMCP Kiên Long' },
  { bin: '970454', shortName: 'VietBank', fullName: 'Ngân hàng TMCP Việt Nam Thương Tín' },
  { bin: '970455', shortName: 'IBK - HCM', fullName: 'Ngân hàng Công Nghiệp Hàn Quốc - Chi nhánh TP. Hồ Chí Minh' },
  { bin: '970456', shortName: 'IBK - HN', fullName: 'Ngân hàng Công Nghiệp Hàn Quốc - Chi nhánh Hà Nội' },
  { bin: '546034', shortName: 'CAKE', fullName: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank' },
  { bin: '546035', shortName: 'Ubank', fullName: 'TMCP Việt Nam Thịnh Vượng - Timo by Ban Viet Bank' },
  { bin: '963388', shortName: 'Timo', fullName: 'Ngân hàng số Timo by Ban Viet Bank' },
];

// Helper to find bank by BIN
export function findBankByBin(bin: string): BankInfo | undefined {
  return VIETNAM_BANKS.find((bank) => bank.bin === bin);
}

// Helper to search banks
export function searchBanks(query: string): BankInfo[] {
  const lowerQuery = query.toLowerCase();
  return VIETNAM_BANKS.filter(
    (bank) =>
      bank.bin.includes(lowerQuery) ||
      bank.shortName.toLowerCase().includes(lowerQuery) ||
      bank.fullName.toLowerCase().includes(lowerQuery)
  );
}
