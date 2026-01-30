/**
 * Componente SF36Results
 * Design: Minimalismo Médico Contemporâneo
 * - Visualização clara de escores
 * - Paleta de cores para indicar saúde
 * - Tipografia hierárquica
 */

import { SF36Results as SF36ResultsType, SCALE_NAMES } from "@/lib/sf36-data";
import { Card } from "@/components/ui/card";

interface SF36ResultsProps {
  results: SF36ResultsType;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-600"; // Excelente
  if (score >= 50) return "text-blue-600"; // Bom
  if (score >= 25) return "text-amber-600"; // Regular
  return "text-red-600"; // Ruim
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Excelente";
  if (score >= 50) return "Bom";
  if (score >= 25) return "Regular";
  return "Crítico";
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={`text-lg font-semibold ${getScoreColor(score)}`}>
          {Math.round(score)}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 75
              ? "bg-green-500"
              : score >= 50
                ? "bg-blue-500"
                : score >= 25
                  ? "bg-amber-500"
                  : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function SF36Results({ results }: SF36ResultsProps) {
  const { scores, pcs, mcs } = results;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Seus Resultados</h2>
        <p className="text-sm text-muted-foreground">
          Escores variam de 0 a 100, onde valores mais altos indicam melhor saúde
        </p>
      </div>

      {/* Summary Scores */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Componentes Resumidos
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Componente Físico (PCS)
            </p>
            <p className={`text-3xl font-bold ${getScoreColor(pcs)}`}>
              {Math.round(pcs)}
            </p>
            <p className="text-xs text-muted-foreground">
              {getScoreLabel(pcs)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Componente Mental (MCS)
            </p>
            <p className={`text-3xl font-bold ${getScoreColor(mcs)}`}>
              {Math.round(mcs)}
            </p>
            <p className="text-xs text-muted-foreground">
              {getScoreLabel(mcs)}
            </p>
          </div>
        </div>
      </Card>

      {/* Detailed Scales */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Escores por Domínio
        </h3>
        <div className="space-y-6">
          <ScoreBar
            score={scores.physicalFunctioning}
            label={SCALE_NAMES.physicalFunctioning}
          />
          <ScoreBar
            score={scores.rolePhysical}
            label={SCALE_NAMES.rolePhysical}
          />
          <ScoreBar
            score={scores.roleEmotional}
            label={SCALE_NAMES.roleEmotional}
          />
          <ScoreBar
            score={scores.pain}
            label={SCALE_NAMES.pain}
          />
          <ScoreBar
            score={scores.generalHealth}
            label={SCALE_NAMES.generalHealth}
          />
          <ScoreBar
            score={scores.energyFatigue}
            label={SCALE_NAMES.energyFatigue}
          />
          <ScoreBar
            score={scores.emotionalWellbeing}
            label={SCALE_NAMES.emotionalWellbeing}
          />
          <ScoreBar
            score={scores.socialFunctioning}
            label={SCALE_NAMES.socialFunctioning}
          />
        </div>
      </Card>

      {/* Interpretation Guide */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Como Interpretar
        </h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">75-100:</span>
            <span>Saúde excelente neste domínio</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">50-74:</span>
            <span>Saúde boa, sem limitações significativas</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-amber-600 font-bold">25-49:</span>
            <span>Saúde regular, algumas limitações presentes</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-600 font-bold">0-24:</span>
            <span>Saúde crítica, limitações significativas</span>
          </li>
        </ul>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 bg-secondary rounded-lg text-xs text-muted-foreground">
        <p>
          <strong>Importante:</strong> Este questionário é uma ferramenta de
          autoavaliação. Os resultados não substituem uma avaliação médica
          profissional. Consulte um profissional de saúde para interpretação
          clínica adequada.
        </p>
      </div>
    </div>
  );
}
