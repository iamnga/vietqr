import React from 'react';
import { Building2, CreditCard, Coins, MapPin, FileText, Info } from 'lucide-react';
import { clsx } from 'clsx';
import type { ParsedVietQR } from '../lib/vietqr-types';
import { findBankByBin } from '../lib/banks';

interface ExtractedInfoProps {
  parsed: ParsedVietQR;
  className?: string;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  tooltip?: string;
  highlight?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, tooltip, highlight = false }) => {
  return (
    <div
      className={clsx(
        'p-4 rounded-lg border transition-all',
        highlight
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
          : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'p-2 rounded-lg flex-shrink-0',
            highlight
              ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
            {tooltip && (
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
                  {tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            )}
          </div>
          <div className="text-base font-semibold text-gray-900 dark:text-gray-100 break-all">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExtractedInfo: React.FC<ExtractedInfoProps> = ({ parsed, className }) => {
  const { extracted } = parsed;

  // Find bank info
  const bankInfo = extracted.bnbId ? findBankByBin(extracted.bnbId) : undefined;

  // Format amount
  const formattedAmount = extracted.amount
    ? new Intl.NumberFormat('vi-VN').format(parseFloat(extracted.amount))
    : undefined;

  return (
    <div className={clsx('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        📋 Thông tin giao dịch
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bank Information - HIGHLIGHTED */}
        {extracted.bnbId && (
          <InfoItem
            icon={<Building2 className="w-5 h-5" />}
            label="Ngân hàng"
            value={
              bankInfo ? (
                <div>
                  <div className="font-bold text-primary-600 dark:text-primary-400">
                    {bankInfo.shortName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {bankInfo.fullName}
                  </div>
                  <div className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1">
                    BIN: {bankInfo.bin}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-mono">{extracted.bnbId}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    (Không xác định được ngân hàng)
                  </div>
                </div>
              )
            }
            tooltip={bankInfo ? `${bankInfo.shortName} - ${bankInfo.fullName}` : 'Mã BIN ngân hàng'}
            highlight={true}
          />
        )}

        {/* Account/Card Number - HIGHLIGHTED */}
        {extracted.accountId && (
          <InfoItem
            icon={<CreditCard className="w-5 h-5" />}
            label={extracted.serviceCode === 'QRIBFTTC' ? 'Số thẻ' : 'Số tài khoản'}
            value={<span className="font-mono">{extracted.accountId}</span>}
            tooltip={
              extracted.serviceCode === 'QRIBFTTC'
                ? 'Số thẻ ngân hàng nhận tiền'
                : 'Số tài khoản ngân hàng nhận tiền'
            }
            highlight={true}
          />
        )}

        {/* Amount - HIGHLIGHTED if present */}
        {extracted.amount && (
          <InfoItem
            icon={<Coins className="w-5 h-5" />}
            label="Số tiền"
            value={
              <div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formattedAmount} ₫
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {extracted.currency === '704' && '(VND - Đồng Việt Nam)'}
                </div>
              </div>
            }
            tooltip="Số tiền giao dịch"
            highlight={true}
          />
        )}

        {/* QR Type */}
        {extracted.initiationMethod && (
          <InfoItem
            icon={<FileText className="w-5 h-5" />}
            label="Loại QR"
            value={
              <div>
                <div className="font-semibold">
                  {extracted.initiationMethod === '11' ? 'QR Tĩnh (Static)' : 'QR Động (Dynamic)'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {extracted.initiationMethod === '11'
                    ? 'Có thể dùng nhiều lần, nhập số tiền khi quét'
                    : 'Dùng một lần, số tiền cố định'}
                </div>
              </div>
            }
            tooltip={`ID01 = ${extracted.initiationMethod}`}
          />
        )}

        {/* Country */}
        {extracted.countryCode && (
          <InfoItem
            icon={<MapPin className="w-5 h-5" />}
            label="Quốc gia"
            value={
              <div>
                <span className="font-semibold">Việt Nam</span>
                <span className="ml-2 text-gray-500">({extracted.countryCode})</span>
              </div>
            }
            tooltip="Mã quốc gia theo ISO 3166-1"
          />
        )}
      </div>

      {/* Additional Data - HIGHLIGHTED if present */}
      {extracted.additionalData && Object.keys(extracted.additionalData).length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📝 Thông tin bổ sung
          </h4>
          <div className="space-y-2">
            {extracted.additionalData['08'] && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                  Nội dung chuyển khoản
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {extracted.additionalData['08']}
                </div>
              </div>
            )}
            {extracted.additionalData['01'] && (
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                <span className="text-gray-500 dark:text-gray-400">Số hóa đơn:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                  {extracted.additionalData['01']}
                </span>
              </div>
            )}
            {extracted.additionalData['05'] && (
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                <span className="text-gray-500 dark:text-gray-400">Mã tham chiếu:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                  {extracted.additionalData['05']}
                </span>
              </div>
            )}
            {extracted.additionalData['03'] && (
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                <span className="text-gray-500 dark:text-gray-400">Cửa hàng:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {extracted.additionalData['03']}
                </span>
              </div>
            )}
            {extracted.additionalData['07'] && (
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                <span className="text-gray-500 dark:text-gray-400">Điểm bán:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {extracted.additionalData['07']}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
