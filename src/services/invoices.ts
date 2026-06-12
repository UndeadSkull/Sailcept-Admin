import { ApiResponse } from "../data/auth";
import { Invoice, PaymentTransaction } from "../data/invoices";

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2025-001",
    bookingId: "#SC-2025-0041",
    amount: 12500,
    date: "15 Jan 2025",
    status: "paid",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2025-002",
    bookingId: "#SC-2025-0042",
    amount: 28000,
    date: "18 Jan 2025",
    status: "pending",
  },
];

const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "tx-1",
    bookingId: "#SC-2025-0041",
    amount: 12500,
    paymentMethod: "UPI",
    transactionTime: "15 Jan 2025, 11:30 AM",
    status: "SUCCESS",
  },
];

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function fetchInvoices(): Promise<ApiResponse<Invoice[]>> {
  await delay(400);
  return { data: MOCK_INVOICES, error: null };
}

export async function fetchTransactions(): Promise<ApiResponse<PaymentTransaction[]>> {
  await delay(400);
  return { data: MOCK_TRANSACTIONS, error: null };
}
