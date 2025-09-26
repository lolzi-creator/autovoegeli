'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'imprint';
}

const LegalModal = ({ isOpen, onClose, type }: LegalModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: t('footer.legal.privacy_title'),
          content: t('footer.legal.privacy_content')
        };
      case 'terms':
        return {
          title: t('footer.legal.terms_title'),
          content: t('footer.legal.terms_content')
        };
      case 'imprint':
        return {
          title: t('footer.legal.imprint_title'),
          content: t('footer.legal.imprint_content')
        };
      default:
        return { title: '', content: '' };
    }
  };

  const { title, content } = getContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            {content.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('footer.legal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
