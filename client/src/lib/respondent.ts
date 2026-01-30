/**
 * Tipo para dados pessoais do respondente
 */
export interface RespondentData {
  fullName: string;
  profession: string;
  age: number;
  email: string;
}

export function isValidRespondentData(data: Partial<RespondentData>): data is RespondentData {
  return (
    typeof data.fullName === 'string' && data.fullName.trim().length > 0 &&
    typeof data.profession === 'string' && data.profession.trim().length > 0 &&
    typeof data.age === 'number' && data.age > 0 && data.age < 150 &&
    typeof data.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  );
}
