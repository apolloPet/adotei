const digitsOnly = (value: string): string => value.replace(/\D/g, '');

export const maskPhoneBR = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const maskCEP = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

export const maskCPF = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export const maskCNPJ = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const isValidEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(normalizeEmail(value));
export const isValidPhoneBR = (value: string): boolean => {
  const len = digitsOnly(value).length;
  return len === 10 || len === 11;
};
export const isValidCEP = (value: string): boolean => digitsOnly(value).length === 8;

const allDigitsEqual = (digits: string): boolean => /^(\d)\1+$/.test(digits);

export const isValidCPF = (value: string): boolean => {
  const cpf = digitsOnly(value);
  if (cpf.length !== 11 || allDigitsEqual(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === Number(cpf[10]);
};

export const isValidCNPJ = (value: string): boolean => {
  const cnpj = digitsOnly(value);
  if (cnpj.length !== 14 || allDigitsEqual(cnpj)) return false;

  const calcCheck = (base: string): number => {
    const factors = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const total = base.split('').reduce((acc, digit, idx) => acc + Number(digit) * factors[idx], 0);
    const mod = total % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const firstCheck = calcCheck(cnpj.slice(0, 12));
  if (firstCheck !== Number(cnpj[12])) return false;
  const secondCheck = calcCheck(cnpj.slice(0, 13));
  return secondCheck === Number(cnpj[13]);
};
