import React, { useState } from 'react';
import { Copy, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { buildVietQR } from '../lib/vietqr';
import type { VietQRFormData, GeneratedQR, InitiationMethod, ServiceCode } from '../lib/vietqr-types';

export const GenerateQR: React.FC = () => {
  const { t } = useApp();

  const [formData, setFormData] = useState<VietQRFormData>({
    initiationMethod: '11',
    serviceCode: 'QRIBFTTA',
    bnbId: '',
    accountId: '',
    amount: '',
    currency: '704',
    countryCode: 'VN',
    additionalData: {},
  });

  const [result, setResult] = useState<GeneratedQR | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field: keyof VietQRFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAdditionalDataChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalData: {
        ...prev.additionalData,
        [field]: value || undefined,
      },
    }));
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);

      // Clean up additional data - remove empty fields
      const cleanedAdditionalData: any = {};
      if (formData.additionalData) {
        Object.entries(formData.additionalData).forEach(([key, value]) => {
          if (value && value.trim()) {
            cleanedAdditionalData[key] = value.trim();
          }
        });
      }

      const cleanedFormData: VietQRFormData = {
        ...formData,
        additionalData: Object.keys(cleanedAdditionalData).length > 0 ? cleanedAdditionalData : undefined,
      };

      const generated = await buildVietQR(cleanedFormData);
      setResult(generated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPNG = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result.pngDataUrl;
      link.download = `vietqr-${Date.now()}.png`;
      link.click();
    }
  };

  const handleDownloadSVG = () => {
    if (result) {
      const blob = new Blob([result.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vietqr-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card title={t.generate.title}>
        <div className="space-y-4">
          {/* QR Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.generate.qrType}
            </label>
            <div className="flex gap-2">
              <Button
                variant={formData.initiationMethod === '11' ? 'primary' : 'outline'}
                onClick={() => handleInputChange('initiationMethod', '11' as InitiationMethod)}
                size="sm"
              >
                {t.generate.static}
              </Button>
              <Button
                variant={formData.initiationMethod === '12' ? 'primary' : 'outline'}
                onClick={() => handleInputChange('initiationMethod', '12' as InitiationMethod)}
                size="sm"
              >
                {t.generate.dynamic}
              </Button>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.generate.serviceType}
            </label>
            <div className="flex gap-2">
              <Button
                variant={formData.serviceCode === 'QRIBFTTA' ? 'primary' : 'outline'}
                onClick={() => handleInputChange('serviceCode', 'QRIBFTTA' as ServiceCode)}
                size="sm"
              >
                {t.generate.toAccount}
              </Button>
              <Button
                variant={formData.serviceCode === 'QRIBFTTC' ? 'primary' : 'outline'}
                onClick={() => handleInputChange('serviceCode', 'QRIBFTTC' as ServiceCode)}
                size="sm"
              >
                {t.generate.toCard}
              </Button>
            </div>
          </div>

          {/* BNB ID */}
          <Input
            label={t.generate.bnbId}
            placeholder={t.generate.bnbPlaceholder}
            value={formData.bnbId}
            onChange={(e) => handleInputChange('bnbId', e.target.value)}
            maxLength={6}
            pattern="[0-9]*"
          />

          {/* Account ID */}
          <Input
            label={t.generate.accountId}
            placeholder={t.generate.accountPlaceholder}
            value={formData.accountId}
            onChange={(e) => handleInputChange('accountId', e.target.value)}
            maxLength={19}
          />

          {/* Amount */}
          <Input
            label={`${t.generate.amount} ${formData.initiationMethod === '11' ? `(${t.common.optional})` : ''}`}
            placeholder={t.generate.amountPlaceholder}
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            pattern="[0-9.]*"
          />

          {/* Currency */}
          <Input
            label={t.generate.currency}
            placeholder={t.generate.currencyPlaceholder}
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
          />

          {/* Country */}
          <Input
            label={t.generate.country}
            placeholder={t.generate.countryPlaceholder}
            value={formData.countryCode}
            onChange={(e) => handleInputChange('countryCode', e.target.value)}
            maxLength={2}
          />

          {/* Additional Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.generate.additionalData} ({t.common.optional})
            </label>
            <div className="space-y-2">
              <Input
                placeholder={t.generate.billNumber}
                value={formData.additionalData?.billNumber || ''}
                onChange={(e) => handleAdditionalDataChange('billNumber', e.target.value)}
              />
              <Input
                placeholder={t.generate.reference}
                value={formData.additionalData?.referenceLabel || ''}
                onChange={(e) => handleAdditionalDataChange('referenceLabel', e.target.value)}
              />
              <Input
                placeholder={t.generate.purpose}
                value={formData.additionalData?.purposeOfTransaction || ''}
                onChange={(e) => handleAdditionalDataChange('purposeOfTransaction', e.target.value)}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !formData.bnbId || !formData.accountId}
            fullWidth
          >
            {loading ? t.generate.generating : t.generate.generate}
          </Button>
        </div>
      </Card>

      {/* Result */}
      {result && (
        <Card title={t.generate.result} className="animate-slide-up">
          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div dangerouslySetInnerHTML={{ __html: result.svg }} className="w-64 h-64" />
            </div>

            {/* Payload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.generate.payload}
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  value={result.payload}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-mono resize-none dark:text-gray-100"
                  rows={4}
                />
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title={t.generate.copy}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">{t.generate.copied}</p>
              )}
            </div>

            {/* CRC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.generate.crc}
              </label>
              <input
                readOnly
                value={result.crc}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-mono dark:text-gray-100"
              />
            </div>

            {/* Download Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleDownloadPNG} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                {t.generate.downloadPNG}
              </Button>
              <Button onClick={handleDownloadSVG} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                {t.generate.downloadSVG}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
