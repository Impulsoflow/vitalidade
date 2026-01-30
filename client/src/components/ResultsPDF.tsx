/**
 * Componente ResultsPDF
 * Gera PDF com os resultados do SF-36
 */

import { SF36Results as SF36ResultsType, SCALE_NAMES } from "@/lib/sf36-data";
import { RespondentData } from "@/lib/respondent";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

interface ResultsPDFProps {
  respondent: RespondentData;
  results: SF36ResultsType;
}

export function ResultsPDF({ respondent, results }: ResultsPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const submitResultsMutation = trpc.sf36.submitResults.useMutation();

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Criar conteúdo do PDF em HTML
      const htmlContent = generatePDFHTML(respondent, results);

      // Usar a API de impressão do navegador para salvar como PDF
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }

      toast.success("PDF pronto para download");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    setIsGenerating(true);
    try {
      await submitResultsMutation.mutateAsync({
        respondent,
        results,
      });

      toast.success("Resultados enviados com sucesso para seu email!");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        {isGenerating ? "Gerando..." : "Baixar PDF"}
      </Button>

      <Button
        onClick={handleSendEmail}
        disabled={isGenerating || submitResultsMutation.isPending}
        size="lg"
        className="gap-2 bg-primary hover:bg-primary/90"
      >
        <Mail className="w-4 h-4" />
        {submitResultsMutation.isPending ? "Enviando..." : "Enviar por Email"}
      </Button>
    </div>
  );
}

function generatePDFHTML(
  respondent: RespondentData,
  results: SF36ResultsType
): string {
  const { scores, pcs, mcs } = results;

  const scoreInterpretation = (score: number): string => {
    if (score >= 75) return "Excelente";
    if (score >= 50) return "Bom";
    if (score >= 25) return "Regular";
    return "Crítico";
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultados SF-36</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      padding: 20px;
      background: white;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #45a67d;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #45a67d;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      color: #999;
      font-style: italic;
      font-size: 12px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      background: #f5f5f5;
      padding: 10px 15px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
      border-left: 4px solid #45a67d;
    }
    .respondent-info {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    .respondent-info p {
      margin-bottom: 8px;
    }
    .respondent-info strong {
      color: #45a67d;
    }
    .scores-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .score-card {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      text-align: center;
    }
    .score-card .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    .score-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #45a67d;
      margin-bottom: 5px;
    }
    .score-card .interpretation {
      font-size: 12px;
      color: #999;
    }
    .scale-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .scale-item:last-child {
      border-bottom: none;
    }
    .scale-name {
      flex: 1;
      font-size: 13px;
    }
    .scale-score {
      font-weight: bold;
      color: #45a67d;
      min-width: 40px;
      text-align: right;
    }
    .interpretation-guide {
      background: #e8f5f0;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .interpretation-guide h3 {
      color: #45a67d;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .interpretation-item {
      font-size: 12px;
      margin-bottom: 8px;
      display: flex;
      gap: 10px;
    }
    .interpretation-item strong {
      min-width: 60px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 11px;
      color: #999;
      text-align: center;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Impulso Coaching</h1>
      <p>a mudança pode acontecer em um instante</p>
    </div>

    <div class="section">
      <div class="section-title">SF-36 - Qualidade de Vida (Versão Brasileira)</div>
      <div class="respondent-info">
        <p><strong>Nome:</strong> ${respondent.fullName}</p>
        <p><strong>Profissão:</strong> ${respondent.profession}</p>
        <p><strong>Idade:</strong> ${respondent.age} anos</p>
        <p><strong>Email:</strong> ${respondent.email}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Componentes Resumidos</div>
      <div class="scores-grid">
        <div class="score-card">
          <div class="label">Componente Físico (PCS)</div>
          <div class="value">${Math.round(pcs)}</div>
          <div class="interpretation">${scoreInterpretation(pcs)}</div>
        </div>
        <div class="score-card">
          <div class="label">Componente Mental (MCS)</div>
          <div class="value">${Math.round(mcs)}</div>
          <div class="interpretation">${scoreInterpretation(mcs)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Escores por Domínio</div>
      <div class="scale-item">
        <span class="scale-name">${SCALE_NAMES.physicalFunctioning}</span>
        <span class="scale-score">${Math.round(scores.physicalFunctioning)}</span>
      </div>
      <div class="scale-item">
        <span class="scale-name">${SCALE_NAMES.rolePhysical}</span>
        <span class="scale-score">${Math.round(scores.rolePhysical)}</span>
      </div>
      <div class="scale-item">
        <span class="scale-name">${SCALE_NAMES.roleEmotional}</span>
        <span class="scale-score">${Math.round(scores.roleEmotional)}</span>
      </div>
      <div class="scale-item">
        <span class="scale-name">${SCALE_NAMES.pain}</span>
        <span class="scale-score">${Math.round(scores.pain)}</span>
      </div>
      <div class="scale-item">
        <span class="scale-name">${SCALE_NAMES.generalHealth}</span>
        <span class="scale-score">${Math.round(scores.generalHealth)}</span>
      </div>
      <div class="scale-item">
        <span class="scale-name">${SCALE_NAMES.energyFatigue}</span>
        <span class="scale-score">${Math.round(scores.energyFatigue)}</span>
      </div>
      <div class="scale-item">
        <span class="scale-name">${SCALE_NAMES.emotionalWellbeing}</span>
        <span class="scale-score">${Math.round(scores.emotionalWellbeing)}</span>
      </div>
      <div class="scale-item">
        <span class="scale-name">${SCALE_NAMES.socialFunctioning}</span>
        <span class="scale-score">${Math.round(scores.socialFunctioning)}</span>
      </div>
    </div>

    <div class="section">
      <div class="interpretation-guide">
        <h3>Como Interpretar os Escores</h3>
        <div class="interpretation-item">
          <strong>75-100:</strong> <span>Saúde excelente neste domínio</span>
        </div>
        <div class="interpretation-item">
          <strong>50-74:</strong> <span>Saúde boa, sem limitações significativas</span>
        </div>
        <div class="interpretation-item">
          <strong>25-49:</strong> <span>Saúde regular, algumas limitações presentes</span>
        </div>
        <div class="interpretation-item">
          <strong>0-24:</strong> <span>Saúde crítica, limitações significativas</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Importante:</strong> Este questionário é uma ferramenta de autoavaliação. Os resultados não substituem uma avaliação médica profissional. Consulte um profissional de saúde para interpretação clínica adequada.</p>
    </div>
  </div>
</body>
</html>
  `;
}
