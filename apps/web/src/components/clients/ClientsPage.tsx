"use client";

import { useTranslation } from "@/hooks/useTranslation";

export function ClientsPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t("clients.title")}</h1>

      <button className="btn-primary mb-4">{t("clients.create")}</button>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>{t("clients.fields.name")}</th>
              <th>{t("clients.fields.cpf")}</th>
              <th>{t("clients.fields.phone")}</th>
              <th>{t("clients.fields.email")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center py-4">
                {t("common.noData")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
