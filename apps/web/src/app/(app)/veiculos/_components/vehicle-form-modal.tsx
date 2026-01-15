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
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {initialData ? "Editar Veículo" : "Novo Veículo"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Placa */}
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) =>
                  setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="ABC-1234"
                maxLength={8}
                required
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium mb-1">Marca *</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Ex: Toyota, Volkswagen"
                required
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium mb-1">Modelo *</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Ex: Corolla, Gol"
                required
              />
            </div>

            {/* Ano */}
            <div>
              <label className="block text-sm font-medium mb-1">Ano *</label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium mb-1">Cor</label>
              <select
                value={formData.cor}
                onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                className="w-full border rounded px-3 py-2"
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
              <label className="block text-sm font-medium mb-1">Quilometragem (km) *</label>
              <input
                type="number"
                value={formData.quilometragem}
                onChange={(e) =>
                  setFormData({ ...formData, quilometragem: Number(e.target.value) })
                }
                className="w-full border rounded px-3 py-2"
                min="0"
                required
              />
            </div>

            {/* Renavam */}
            <div>
              <label className="block text-sm font-medium mb-1">RENAVAM</label>
              <input
                type="text"
                value={formData.renavam}
                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="00000000000"
                maxLength={11}
              />
            </div>

            {/* Chassi */}
            <div>
              <label className="block text-sm font-medium mb-1">CHASSI</label>
              <input
                type="text"
                value={formData.chassi}
                onChange={(e) =>
                  setFormData({ ...formData, chassi: e.target.value.toUpperCase() })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="9BWZZZ377VT004251"
                maxLength={17}
              />
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="LOCADO">Locado</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
