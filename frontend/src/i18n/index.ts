import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import zh_CN from './locales/zh-CN.json';
import en_US from './locales/en-US.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        translation: zh_CN,
      },
      'en-US': {
        translation: en_US,
      },
    },
    fallbackLng: 'zh-CN',
    defaultNS: 'translation',
    debug: import.meta.env.DEV,
    
    // 语言检测配置
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'yinji-language',
      caches: ['localStorage'],
    },
    
    // 插值配置
    interpolation: {
      escapeValue: false,
    },
    
    // 兼容性配置
    react: {
      useSuspense: false,
    },
  });

export default i18n;
