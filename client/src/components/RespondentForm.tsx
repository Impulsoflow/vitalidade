/**
 * Componente RespondentForm
 * Formulário para coleta de dados pessoais obrigatórios
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RespondentData, isValidRespondentData } from "@/lib/respondent";
import { AlertCircle } from "lucide-react";

interface RespondentFormProps {
  onSubmit: (data: RespondentData) => void;
  isLoading?: boolean;
}

export function RespondentForm({ onSubmit, isLoading = false }: RespondentFormProps) {
  const [formData, setFormData] = useState<Partial<RespondentData>>({
    fullName: "",
    profession: "",
    age: undefined,
    email: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RespondentData, string>>>({});

  const validateField = (field: keyof RespondentData, value: unknown): string | undefined => {
    switch (field) {
      case "fullName":
        if (typeof value !== "string" || value.trim().length === 0) {
          return "Nome completo é obrigatório";
        }
        if (value.trim().length < 3) {
          return "Nome deve ter pelo menos 3 caracteres";
        }
        return undefined;

      case "profession":
        if (typeof value !== "string" || value.trim().length === 0) {
          return "Profissão é obrigatória";
        }
        return undefined;

      case "age":
        const age = Number(value);
        if (isNaN(age) || age <= 0 || age >= 150) {
          return "Idade deve ser um número entre 1 e 149";
        }
        return undefined;

      case "email":
        if (typeof value !== "string" || value.trim().length === 0) {
          return "Email é obrigatório";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Email inválido";
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (field: keyof RespondentData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validar campo ao mudar
    const error = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos os campos
    const newErrors: Partial<Record<keyof RespondentData, string>> = {};
    let hasErrors = false;

    (["fullName", "profession", "age", "email"] as const).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    if (isValidRespondentData(formData)) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Dados Pessoais (Obrigatório)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome Completo */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Nome Completo *
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Seu nome completo"
            value={formData.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            disabled={isLoading}
            className={errors.fullName ? "border-destructive" : ""}
          />
          {errors.fullName && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {errors.fullName}
            </div>
          )}
        </div>

        {/* Profissão */}
        <div className="space-y-2">
          <Label htmlFor="profession" className="text-sm font-medium">
            Profissão *
          </Label>
          <Input
            id="profession"
            type="text"
            placeholder="Sua profissão"
            value={formData.profession || ""}
            onChange={(e) => handleChange("profession", e.target.value)}
            disabled={isLoading}
            className={errors.profession ? "border-destructive" : ""}
          />
          {errors.profession && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {errors.profession}
            </div>
          )}
        </div>

        {/* Idade */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-sm font-medium">
            Idade *
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Sua idade"
            value={formData.age || ""}
            onChange={(e) => handleChange("age", e.target.value ? Number(e.target.value) : undefined)}
            disabled={isLoading}
            className={errors.age ? "border-destructive" : ""}
            min="1"
            max="149"
          />
          {errors.age && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {errors.age}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={isLoading}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? "Processando..." : "Continuar para Questionário"}
        </Button>
      </form>
    </Card>
  );
}
