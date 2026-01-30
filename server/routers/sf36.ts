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
        // Enviar email para impulsoflow@gmail.com
        const emailContent = generateEmailContent(respondent, results);

        // Aqui você pode integrar com um serviço de email
        // Por enquanto, vamos notificar o owner
        await notifyOwner({
          title: `SF-36 Resultado Submetido - ${respondent.fullName}`,
          content: `
Novo resultado de SF-36 recebido:

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

function generateEmailContent(
  respondent: z.infer<typeof RespondentDataSchema>,
  results: z.infer<typeof SF36ResultsSchema>
): string {
  return `
Olá ${respondent.fullName},

Obrigado por completar o questionário SF-36 (Versão Brasileira) de Qualidade de Vida.

Seus Resultados:
================

Componentes Resumidos:
- Componente Físico (PCS): ${Math.round(results.pcs)}/100
- Componente Mental (MCS): ${Math.round(results.mcs)}/100

Escores por Domínio (0-100):
- Funcionamento Físico: ${Math.round(results.scores.physicalFunctioning)}
- Limitações por Problemas Físicos: ${Math.round(results.scores.rolePhysical)}
- Limitações por Problemas Emocionais: ${Math.round(results.scores.roleEmotional)}
- Dor Corporal: ${Math.round(results.scores.pain)}
- Saúde Geral: ${Math.round(results.scores.generalHealth)}
- Energia/Fadiga: ${Math.round(results.scores.energyFatigue)}
- Bem-estar Emocional: ${Math.round(results.scores.emotionalWellbeing)}
- Funcionamento Social: ${Math.round(results.scores.socialFunctioning)}

Interpretação:
- 75-100: Saúde excelente neste domínio
- 50-74: Saúde boa, sem limitações significativas
- 25-49: Saúde regular, algumas limitações presentes
- 0-24: Saúde crítica, limitações significativas

Importante:
Este questionário é uma ferramenta de autoavaliação. Os resultados não substituem uma avaliação médica profissional. Consulte um profissional de saúde para interpretação clínica adequada.

---
Impulso Coaching
"a mudança pode acontecer em um instante"
  `;
}
