interface State {
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
  connectWallet?: () => void;
  sendTransaction?: () => void;
  formData?: any;
  isLoading?: boolean;
  currentAccount?: string;
  transactions?: any;
  transactionCount?: string | null;
}
