import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { BankInfo } from '../lib/banks';
import { VIETNAM_BANKS, searchBanks } from '../lib/banks';

interface BankSelectProps {
  value: string;
  onChange: (bin: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export const BankSelect: React.FC<BankSelectProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Tìm và chọn ngân hàng...',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBanks, setFilteredBanks] = useState<BankInfo[]>(VIETNAM_BANKS);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedBank = VIETNAM_BANKS.find((bank) => bank.bin === value);

  useEffect(() => {
    if (searchQuery) {
      setFilteredBanks(searchBanks(searchQuery));
    } else {
      setFilteredBanks(VIETNAM_BANKS);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (bank: BankInfo) => {
    onChange(bank.bin);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Selected value or trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full px-3 py-2 border rounded-lg shadow-sm text-left',
            'flex items-center justify-between',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'dark:bg-gray-800 dark:text-gray-100 transition-colors',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={clsx(selectedBank ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400')}>
            {selectedBank ? (
              <span className="flex items-center gap-2">
                <span className="font-mono text-primary-600 dark:text-primary-400">
                  {selectedBank.bin}
                </span>
                <span>-</span>
                <span className="font-semibold">{selectedBank.shortName}</span>
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown
            className={clsx(
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo BIN, tên ngân hàng..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Bank list */}
            <div className="overflow-y-auto max-h-80">
              {filteredBanks.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Không tìm thấy ngân hàng
                </div>
              ) : (
                <ul role="listbox">
                  {filteredBanks.map((bank) => (
                    <li
                      key={bank.bin}
                      role="option"
                      aria-selected={bank.bin === value}
                      onClick={() => handleSelect(bank)}
                      className={clsx(
                        'px-3 py-2.5 cursor-pointer flex items-center justify-between',
                        'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                        bank.bin === value && 'bg-primary-50 dark:bg-primary-900/20'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400">
                            {bank.bin}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {bank.shortName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {bank.name}
                        </div>
                      </div>
                      {bank.bin === value && (
                        <Check className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 ml-2" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
