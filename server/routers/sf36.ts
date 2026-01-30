/**
 * tRPC Router para SF-36
 * Procedimentos para enviar resultados por email
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

const RespondentDataSchema = z.object({
  fullName: z.string().min(3),
  profession: z.string().min(1),
  age: z.number().min(1).max(149),
  email: z.string().email(),
});

const SF36ScoresSchema = z.object({
  physicalFunctioning: z.number(),
  rolePhysical: z.number(),
  roleEmotional: z.number(),
  energyFatigue: z.number(),
  emotionalWellbeing: z.number(),
  socialFunctioning: z.number(),
  pain: z.number(),
  generalHealth: z.number(),
  healthChange: z.number(),
});

const SF36ResultsSchema = z.object({
  scores: SF36ScoresSchema,
  pcs: z.number(),
  mcs: z.number(),
});

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  // Usar a API Forge para enviar email
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!forgeApiUrl || !forgeApiKey) {
    console.warn("Email service not configured");
    return;
  }

  try {
    const response = await fetch(`${forgeApiUrl}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${forgeApiKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      console.error(`Email send failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

function generateEmailHtml(
  respondent: z.infer<typeof RespondentDataSchema>,
  results: z.infer<typeof SF36ResultsSchema>
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2d5016; color: white; padding: 20px; text-align: center; border-radius: 5px; }
    .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .score-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
    .score-value { font-weight: bold; color: #2d5016; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
    h2 { color: #2d5016; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Índice de Vitalidade</h1>
      <p>Avaliação da saúde física/mental</p>
    </div>

    <div class="content">
      <p>Olá <strong>${respondent.fullName}</strong>,</p>
      <p>Obrigado por completar o Índice de Vitalidade. Abaixo estão seus resultados:</p>

      <h2>Componentes Resumidos</h2>
      <div class="score-item">
        <span>Componente Físico (PCS)</span>
        <span class="score-value">${Math.round(results.pcs)}/100</span>
      </div>
      <div class="score-item">
        <span>Componente Mental (MCS)</span>
        <span class="score-value">${Math.round(results.mcs)}/100</span>
      </div>

      <h2>Escores por Domínio</h2>
      <div class="score-item">
        <span>Funcionamento Físico</span>
        <span class="score-value">${Math.round(results.scores.physicalFunctioning)}</span>
      </div>
      <div class="score-item">
        <span>Limitações por Problemas Físicos</span>
        <span class="score-value">${Math.round(results.scores.rolePhysical)}</span>
      </div>
      <div class="score-item">
        <span>Limitações por Problemas Emocionais</span>
        <span class="score-value">${Math.round(results.scores.roleEmotional)}</span>
      </div>
      <div class="score-item">
        <span>Dor Corporal</span>
        <span class="score-value">${Math.round(results.scores.pain)}</span>
      </div>
      <div class="score-item">
        <span>Saúde Geral</span>
        <span class="score-value">${Math.round(results.scores.generalHealth)}</span>
      </div>
      <div class="score-item">
        <span>Energia/Fadiga</span>
        <span class="score-value">${Math.round(results.scores.energyFatigue)}</span>
      </div>
      <div class="score-item">
        <span>Bem-estar Emocional</span>
        <span class="score-value">${Math.round(results.scores.emotionalWellbeing)}</span>
      </div>
      <div class="score-item">
        <span>Funcionamento Social</span>
        <span class="score-value">${Math.round(results.scores.socialFunctioning)}</span>
      </div>

      <h2>Como Interpretar</h2>
      <ul>
        <li><strong>75-100:</strong> Saúde excelente neste domínio</li>
        <li><strong>50-74:</strong> Saúde boa, sem limitações significativas</li>
        <li><strong>25-49:</strong> Saúde regular, algumas limitações presentes</li>
        <li><strong>0-24:</strong> Saúde crítica, limitações significativas</li>
      </ul>

      <p style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>Importante:</strong> Este questionário é uma ferramenta de autoavaliação. Os resultados não substituem uma avaliação médica profissional. Consulte um profissional de saúde para interpretação clínica adequada.
      </p>
    </div>

    <div class="footer">
      <p><strong>Impulso Coaching</strong></p>
      <p>"a mudança pode acontecer em um instante"</p>
    </div>
  </div>
</body>
</html>
  `;
}

export const sf36Router = router({
  submitResults: publicProcedure
    .input(
      z.object({
        respondent: RespondentDataSchema,
        results: SF36ResultsSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { respondent, results } = input;

      try {
        // Gerar conteúdo do email em HTML
        const emailHtml = generateEmailHtml(respondent, results);

        // Enviar email para o respondente
        await sendEmail(
          respondent.email,
          "Seus Resultados - Índice de Vitalidade",
          emailHtml
        );

        // Enviar também para impulsoflow@gmail.com
        await sendEmail(
          "impulsoflow@gmail.com",
          `Novo Resultado SF-36 - ${respondent.fullName}`,
          emailHtml
        );

        // Notificar o owner sobre a submissão
        await notifyOwner({
          title: `Novo Resultado SF-36 - ${respondent.fullName}`,
          content: `
Novo resultado de Índice de Vitalidade recebido:

**Respondente:** ${respondent.fullName}
**Profissão:** ${respondent.profession}
**Idade:** ${respondent.age} anos
**Email:** ${respondent.email}

**Componente Físico (PCS):** ${Math.round(results.pcs)}
**Componente Mental (MCS):** ${Math.round(results.mcs)}

Escores por Domínio:
- Funcionamento Físico: ${Math.round(results.scores.physicalFunctioning)}
- Limitações por Problemas Físicos: ${Math.round(results.scores.rolePhysical)}
- Limitações por Problemas Emocionais: ${Math.round(results.scores.roleEmotional)}
- Dor Corporal: ${Math.round(results.scores.pain)}
- Saúde Geral: ${Math.round(results.scores.generalHealth)}
- Energia/Fadiga: ${Math.round(results.scores.energyFatigue)}
- Bem-estar Emocional: ${Math.round(results.scores.emotionalWellbeing)}
- Funcionamento Social: ${Math.round(results.scores.socialFunctioning)}
          `,
        });

        return {
          success: true,
          message: "Resultados enviados com sucesso para seu email",
        };
      } catch (error) {
        console.error("Erro ao enviar resultados:", error);
        throw new Error("Falha ao enviar resultados");
      }
    }),
});
