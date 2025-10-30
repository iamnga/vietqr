import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './Button';
import { Card } from './Card';
import { parseVietQR, validateVietQR } from '../lib/vietqr';
import type { ParsedVietQR, ValidationReport } from '../lib/vietqr-types';

export const DecodeQR: React.FC = () => {
  const { t } = useApp();

  const [payloadInput, setPayloadInput] = useState('');
  const [result, setResult] = useState<ParsedVietQR | null>(null);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDecode = async (input: string | File) => {
    try {
      setLoading(true);
      setError('');
      setResult(null);
      setValidation(null);

      const parsed = await parseVietQR(input);
      const validationResult = validateVietQR(parsed);

      setResult(parsed);
      setValidation(validationResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextDecode = () => {
    if (payloadInput.trim()) {
      handleDecode(payloadInput.trim());
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      handleDecode(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <Card title={t.decode.title}>
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.decode.uploadImage}
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                }
              `}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.decode.dragDrop}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {t.decode.clickToUpload}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                {t.decode.orPastePayload}
              </span>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <textarea
              placeholder={t.decode.pasteHere}
              value={payloadInput}
              onChange={(e) => setPayloadInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none dark:bg-gray-900 dark:text-gray-100 font-mono text-sm"
              rows={6}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Decode Button */}
          <Button
            onClick={handleTextDecode}
            disabled={loading || !payloadInput.trim()}
            fullWidth
          >
            {loading ? t.decode.decoding : t.decode.decode}
          </Button>
        </div>
      </Card>

      {/* Result */}
      {result && validation && (
        <div className="space-y-6 animate-slide-up">
          {/* Validation Status */}
          <Card>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t.decode.validation}
              </h3>
              <div className="flex items-center gap-2">
                {validation.isValid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {t.decode.validQR}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {t.decode.invalidQR}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {validation.crcValid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {t.decode.crcValid}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {t.decode.crcInvalid}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Issues */}
          {validation.issues.length > 0 && (
            <Card title={t.decode.issues}>
              <div className="space-y-2">
                {validation.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg ${getLevelColor(issue.level)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-white dark:bg-gray-800 rounded">
                        {issue.level}
                      </span>
                      <span className="text-xs font-mono">{issue.field}</span>
                    </div>
                    <p className="text-sm mt-2">{issue.message}</p>
                    {issue.suggestion && (
                      <p className="text-sm mt-1 italic">💡 {issue.suggestion}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {validation.issues.length === 0 && validation.isValid && (
            <Card>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t.decode.noIssues}</span>
              </div>
            </Card>
          )}

          {/* Fields */}
          <Card title={t.decode.fields}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                      {t.decode.field}
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                      {t.decode.name}
                    </th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">
                      {t.decode.value}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.fields.map((field, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 px-2 font-mono text-primary-600 dark:text-primary-400">
                          {field.id}
                        </td>
                        <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                          {field.name}
                        </td>
                        <td className="py-2 px-2 font-mono text-gray-900 dark:text-gray-100 break-all">
                          {field.value}
                        </td>
                      </tr>
                      {field.subFields &&
                        field.subFields.map((subField, subIndex) => (
                          <tr
                            key={`${index}-${subIndex}`}
                            className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                          >
                            <td className="py-2 px-2 pl-6 font-mono text-sm text-primary-500 dark:text-primary-400">
                              {field.id}.{subField.id}
                            </td>
                            <td className="py-2 px-2 text-sm text-gray-600 dark:text-gray-400">
                              {subField.name}
                            </td>
                            <td className="py-2 px-2 font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
                              {subField.value}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Raw Payload */}
          <Card title={t.decode.rawPayload}>
            <textarea
              readOnly
              value={result.raw}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm font-mono resize-none dark:text-gray-100"
              rows={4}
            />
          </Card>
        </div>
      )}
    </div>
  );
};
