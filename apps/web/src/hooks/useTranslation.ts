import { i18nConfig } from "@/i18n/config";

type TranslationKey = string;

export function useTranslation(locale: string = "pt-BR") {
  const translations = i18nConfig.translations[locale as keyof typeof i18nConfig.translations];

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: Record<string, unknown> = translations;

    for (const k of keys) {
      value = ((value as Record<string, unknown>)?.[k] ?? {}) as Record<string, unknown>;
    }

    if (typeof value !== "string") {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce<string>(
        (acc, [__paramKey, paramValue]) => acc.replace("{${paramKey}}", String(paramValue)),
        value,
      );
    }

    return value;
  };

  return { t, locale };
}
