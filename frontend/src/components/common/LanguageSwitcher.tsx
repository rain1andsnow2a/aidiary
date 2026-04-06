import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="zh-CN">🇨🇳 中文</option>
        <option value="en-US">🇺🇸 English</option>
      </select>
    </div>
  );
}
