import translations from "@/i18n/locales/pt-BR.json";

type TranslationKey = keyof typeof translations;

export function useTranslation() {
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = String(translations[key]);

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, "g"), String(value));
      });
    }

    return translation;
  };

  return { t };
}
