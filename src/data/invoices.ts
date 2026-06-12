export type InvoiceStatus = "paid" | "pending" | "overdue";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
};

export type PaymentTransaction = {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  transactionTime: string;
  status: string;
};
