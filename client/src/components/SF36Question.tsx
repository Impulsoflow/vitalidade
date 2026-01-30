/**
 * Componente SF36Question
 * Design: Minimalismo Médico Contemporâneo
 * - Hierarquia tipográfica clara
 * - Espaçamento generoso
 * - Foco na legibilidade
 */

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SF36Question as SF36QuestionType } from "@/lib/sf36-data";

interface SF36QuestionProps {
  question: SF36QuestionType;
  value?: number;
  onChange: (value: number) => void;
  isAnswered: boolean;
}

export function SF36Question({
  question,
  value,
  onChange,
  isAnswered,
}: SF36QuestionProps) {
  return (
    <div className="space-y-4 py-6 border-b border-border last:border-b-0">
      {/* Question Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-muted-foreground min-w-6">
            {question.id}.
          </span>
          <h3 className="text-base font-medium text-foreground leading-relaxed">
            {question.text}
          </h3>
        </div>

        {/* Subtext if present */}
        {question.subtext && (
          <p className="text-sm text-muted-foreground ml-9">
            {question.subtext}
          </p>
        )}
      </div>

      {/* Radio Group Options */}
      <RadioGroup value={value?.toString() || ""} onValueChange={(v) => onChange(Number(v))}>
        <div className="space-y-3 ml-9">
          {question.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <RadioGroupItem
                value={option.value.toString()}
                id={`q${question.id}_opt${option.value}`}
                className="border-2 border-border"
              />
              <Label
                htmlFor={`q${question.id}_opt${option.value}`}
                className="text-sm font-normal text-foreground cursor-pointer hover:text-primary transition-colors"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Visual indicator for answered state */}
      {isAnswered && (
        <div className="ml-9 h-1 w-8 bg-primary rounded-full" />
      )}
    </div>
  );
}
