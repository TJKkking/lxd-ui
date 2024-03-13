import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend) // 加载翻译资源文件
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 通过react-i18next传递i18next实例
  .init({
    supportedLngs: ["zh-CN", "en"], // 支持的语言列表
    fallbackLng: "en", // 默认语言
    lng: "zh-CN", // 当前语言
    debug: true, // 开启调试模式，在控制台输出信息
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },
    interpolation: {
      escapeValue: false, // 不需要对xss防护因为React已经处理
    },
  });

export default i18n;
