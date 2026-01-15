"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Vehicle } from "@/lib/api/vehicles";

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Vehicle | null;
}

const CAR_COLORS = [
  "Branco",
  "Preto",
  "Prata",
  "Cinza",
  "Vermelho",
  "Azul",
  "Verde",
  "Amarelo",
  "Marrom",
  "Bege",
];

export function VehicleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: VehicleFormModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    placa: "",
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    cor: "",
    quilometragem: 0,
    renavam: "",
    chassi: "",
    status: "DISPONIVEL",
    valorDiaria: 0,
    valorSemanal: 0,
    valorMensal: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        placa: initialData.placa,
        marca: initialData.marca,
        modelo: initialData.modelo,
        ano: initialData.ano,
        cor: initialData.cor || "",
        quilometragem: initialData.quilometragem || 0,
        renavam: initialData.renavam || "",
        chassi: initialData.chassi || "",
        status: initialData.status,
        valorDiaria: (initialData as any).valorDiaria || 0,
        valorSemanal: (initialData as any).valorSemanal || 0,
        valorMensal: (initialData as any).valorMensal || 0,
      });
    } else {
      setFormData({
        id: "",
        placa: "",
        marca: "",
        modelo: "",
        ano: new Date().getFullYear(),
        cor: "",
        quilometragem: 0,
        renavam: "",
        chassi: "",
        status: "DISPONIVEL",
        valorDiaria: 0,
        valorSemanal: 0,
        valorMensal: 0,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação: TODOS os valores devem ser preenchidos
    if (!formData.valorDiaria || !formData.valorSemanal || !formData.valorMensal) {
      alert("❌ Todos os valores (Diária, Semanal e Mensal) devem ser preenchidos!");
      return;
    }

    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Editar Veículo" : "Novo Veículo"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Placa */}
            <div>
              <label className={labelClass}>Placa *</label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) =>
                  setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                }
                className={inputClass}
                placeholder="ABC-1234"
                maxLength={8}
                required
              />
            </div>

            {/* Marca */}
            <div>
              <label className={labelClass}>Marca *</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className={inputClass}
                placeholder="Ex: Toyota, Volkswagen"
                required
              />
            </div>

            {/* Modelo */}
            <div>
              <label className={labelClass}>Modelo *</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className={inputClass}
                placeholder="Ex: Corolla, Gol"
                required
              />
            </div>

            {/* Ano */}
            <div>
              <label className={labelClass}>Ano *</label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                className={inputClass}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            {/* Cor */}
            <div>
              <label className={labelClass}>Cor</label>
              <select
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecione...</option>
                {CAR_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {/* Quilometragem */}
            <div>
              <label className={labelClass}>Quilometragem (km) *</label>
              <input
                type="number"
                value={formData.quilometragem}
                onChange={(e) =>
                  setFormData({ ...formData, quilometragem: Number(e.target.value) })
                }
                className={inputClass}
                min="0"
                required
              />
            </div>

            {/* Renavam */}
            <div>
              <label className={labelClass}>RENAVAM</label>
              <input
                type="text"
                value={formData.renavam}
                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                className={inputClass}
                placeholder="00000000000"
                maxLength={11}
              />
            </div>

            {/* Chassi */}
            <div>
              <label className={labelClass}>CHASSI</label>
              <input
                type="text"
                value={formData.chassi}
                onChange={(e) =>
                  setFormData({ ...formData, chassi: e.target.value.toUpperCase() })
                }
                className={inputClass}
                placeholder="9BWZZZ377VT004251"
                maxLength={17}
              />
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label className={labelClass}>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={inputClass}
                required
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="LOCADO">Locado</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>

          {/* Seção de Valores - Fundo Laranja Vibrante */}
          <div className="bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔥</span>
              <p className="text-base font-bold text-orange-900">
                Valores (Todos obrigatórios) *
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-1.5">
                  Diária (R$) *
                </label>
                <input
                  type="number"
                  value={formData.valorDiaria}
                  onChange={(e) =>
                    setFormData({ ...formData, valorDiaria: Number(e.target.value) })
                  }
                  className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                  min="0"
                  step="0.01"
                  placeholder="150.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-1.5">
                  Semanal (R$) *
                </label>
                <input
                  type="number"
                  value={formData.valorSemanal}
                  onChange={(e) =>
                    setFormData({ ...formData, valorSemanal: Number(e.target.value) })
                  }
                  className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                  min="0"
                  step="0.01"
                  placeholder="900.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-1.5">
                  Mensal (R$) *
                </label>
                <input
                  type="number"
                  value={formData.valorMensal}
                  onChange={(e) =>
                    setFormData({ ...formData, valorMensal: Number(e.target.value) })
                  }
                  className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                  min="0"
                  step="0.01"
                  placeholder="3000.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
