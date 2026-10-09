import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, FileText, IndianRupee } from 'lucide-react';
import { PaymentTransactionRecord } from '../../types/payment';

interface GSTInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransactionRecord | null;
}

export const GSTInvoiceModal: React.FC<GSTInvoiceModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isIntraState = true; // Gujarat to Gujarat: CGST 9% + SGST 9%
  const cgst = isIntraState ? Math.round((transaction.tax_amount / 2) * 100) / 100 : 0;
  const sgst = isIntraState ? Math.round((transaction.tax_amount / 2) * 100) / 100 : 0;
  const igst = !isIntraState ? transaction.tax_amount : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-2xl text-white shadow-2xl p-6 relative print:bg-white print:text-black print:border-none print:shadow-none print:max-w-full">
        {/* Actions bar (hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">GST Tax Invoice</h3>
              <p className="text-[11px] text-slate-400 font-mono">{transaction.invoice_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2E25] hover:bg-[#134E3E] border border-emerald-700 text-emerald-300 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="mt-4 p-5 rounded-xl bg-[#08101A] border border-[#182635] print:bg-white print:border-black/20 print:p-0 print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:border-black/20">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border border-emerald-500 bg-[#0E1C28] flex items-center justify-center text-[7px] font-black text-emerald-400 leading-none">
                  ANI<br />GUARD
                </div>
                <h1 className="text-lg font-bold text-white print:text-black tracking-tight">AniGuard AgriTech Pvt. Ltd.</h1>
              </div>
              <p className="text-[11px] text-slate-400 print:text-slate-600 mt-1 leading-relaxed">
                Anand Agri-Business Incubator (AABI), AAU Campus<br />
                Anand, Gujarat - 388110, India<br />
                <strong>GSTIN:</strong> 24AABCA1234F1Z8 • <strong>CIN:</strong> U72900GJ2026PTC088210
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-300">
                TAX INVOICE (कर चालान)
              </span>
              <p className="text-xs font-mono font-bold text-white print:text-black mt-1.5">
                {transaction.invoice_number}
              </p>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                Date: {new Date(transaction.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-[10px] font-mono text-emerald-400 print:text-emerald-800 mt-0.5">
                Gateway: {transaction.payment_gateway.toUpperCase()} • Razorpay Verified
              </p>
            </div>
          </div>

          {/* Billed To Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs border-b border-slate-800 print:border-black/20">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 tracking-wider">BILLED TO (ग्राहक विवरण):</p>
              <p className="font-bold text-white print:text-black text-sm mt-0.5">{transaction.user_name || 'Dairy Farmer'}</p>
              <p className="text-slate-300 print:text-slate-700 mt-0.5">{transaction.user_email}</p>
              {transaction.user_phone && <p className="text-slate-400 print:text-slate-600 font-mono">{transaction.user_phone}</p>}
              <p className="text-slate-400 print:text-slate-600 mt-0.5">State: Gujarat (24) • Category: Smallholder Livestock</p>
            </div>

            <div className="sm:text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 tracking-wider">PAYMENT IDENTIFIERS:</p>
              <p className="text-[11px] font-mono text-slate-300 print:text-slate-700 mt-0.5">
                Razorpay ID: <span className="font-bold text-white print:text-black">{transaction.razorpay_payment_id}</span>
              </p>
              <p className="text-[11px] font-mono text-slate-400 print:text-slate-600 mt-0.5">
                Order ID: {transaction.razorpay_order_id}
              </p>
              <p className="text-[11px] text-emerald-400 print:text-emerald-800 font-semibold mt-1">
                Status: PAID (सफल भुगतान)
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 print:border-black/20 text-slate-400 print:text-slate-600 text-[10px] uppercase font-bold text-left">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">SAC Code</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Taxable Amt</th>
                  <th className="pb-2 text-right">GST (18%)</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-black/10">
                <tr>
                  <td className="py-2.5">
                    <p className="font-bold text-white print:text-black">{transaction.item_name}</p>
                    <p className="text-[10px] text-slate-400 print:text-slate-600">
                      {transaction.billing_cycle ? `Billing Cycle: ${transaction.billing_cycle.toUpperCase()}` : 'One-Time On-Demand Service'}
                    </p>
                  </td>
                  <td className="py-2.5 text-center font-mono text-slate-400 print:text-slate-600">998313</td>
                  <td className="py-2.5 text-center text-slate-300 print:text-slate-700">1</td>
                  <td className="py-2.5 text-right font-mono text-slate-300 print:text-slate-700">₹{transaction.base_amount.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono text-slate-300 print:text-slate-700">₹{transaction.tax_amount.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-white print:text-black">₹{transaction.amount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Total */}
          <div className="pt-3 border-t border-slate-800 print:border-black/20 flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div className="space-y-1 text-slate-400 print:text-slate-600 text-[11px]">
              <p>• CGST @ 9.0%: ₹{cgst.toLocaleString()}</p>
              <p>• SGST @ 9.0%: ₹{sgst.toLocaleString()}</p>
              {igst > 0 && <p>• IGST @ 18.0%: ₹{igst.toLocaleString()}</p>}
              <p className="text-[10px] italic pt-1">This is a computer-generated tax invoice and requires no physical signature.</p>
            </div>

            <div className="sm:text-right space-y-1 min-w-[160px]">
              <div className="flex justify-between sm:justify-end gap-4 text-slate-400 print:text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{transaction.base_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4 text-slate-400 print:text-slate-600">
                <span>Total Tax (18%):</span>
                <span className="font-mono">₹{transaction.tax_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-4 font-bold text-sm text-emerald-400 print:text-black pt-1 border-t border-slate-800 print:border-black/20">
                <span>Grand Total:</span>
                <span className="font-mono">₹{transaction.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Badges */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 print:hidden">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit SSL Encrypted & Razorpay PCI-DSS Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs transition"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
