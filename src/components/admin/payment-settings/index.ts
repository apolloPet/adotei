
export { default as FeesSection } from './FeesSection';
export { default as BankDetailsSection } from './BankDetailsSection';
export { default as ContractSection } from './ContractSection';

export interface PaymentSettingsProps {
  settings: {
    fees: {
      adoptionFee: number;
      enableAdoptionFee: boolean;
    };
    bankDetails: {
      pixKey: string;
      companyBankInfo: string;
      ongBankAccount?: {
        bank: string;
        agency: string;
        accountNumber: string;
        accountHolder: string;
        documentNumber: string;
      };
      companyBankAccount?: {
        bank: string;
        agency: string;
        accountNumber: string;
        accountHolder: string;
        documentNumber: string;
      };
    };
    contractDetails: {
      contractText: string;
      followUpPeriod: number;
    };
  };
  onSaveSettings: (newSettings: any) => void;
}
