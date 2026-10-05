"use client";

import dayjs from "dayjs";
import { ISSUER, BANK, VAT_RATE } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import "./invoice.css";

const fmtDate = (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "-");

const MODE_LABEL: Record<string, string> = {
    VIREMENT: "Virement bancaire",
    CARTE: "Carte",
    ESPECES: "Espèces",
};

export function InvoiceTemplate({ invoice }: { invoice: any }) {
    const sub = invoice.subscription;
    const customer = sub?.customer;
    const billings: any[] = invoice.billings ?? [];

    const totalHt = Number(invoice.total_ht);
    const totalTtc = Number(invoice.total_ttc);
    const vatAmount = Math.round((totalTtc - totalHt) * 100) / 100;
    const paid = billings.reduce((s, b) => s + Number(b.amount), 0);
    const isPaid = invoice.status === "PAID";
    const isCancelled = invoice.status === "CANCELLED";
    const amountDue = isCancelled
        ? 0
        : Math.max(Math.round((totalTtc - paid) * 100) / 100, 0);
    return (
        <div className="inv-sheet">
            {/* Header */}
            <div className="inv-header">
                <div>
                    <img src="/logo-apeerk.svg" alt="Apeerk" height={32} />
                    <h1>FACTURE / INVOICE</h1>
                    <div className="inv-number">{invoice.invoice_number}</div>
                </div>
                <div className="inv-issuer">
                    <strong>{ISSUER.name}</strong>
                    {ISSUER.addressLines.map((l) => (
                        <div key={l}>{l}</div>
                    ))}
                    <div>TVA : {ISSUER.vatNumber}</div>
                    <div>{ISSUER.email}</div>
                </div>
            </div>

            {/* Metadata */}
            <div className="inv-meta">
                <div>
                    <div className="inv-label">Date d'émission / Issue date</div>
                    <div className="inv-value">{fmtDate(invoice.issue_date)}</div>
                </div>
                <div>
                    <div className="inv-label">Date d'échéance / Due date</div>
                    <div className="inv-value">{fmtDate(invoice.due_date)}</div>
                </div>
                <div>
                    <div className="inv-label">Période / Service period</div>
                    <div className="inv-value">
                        {fmtDate(invoice.consumption_start)} - {fmtDate(invoice.consumption_end)}
                    </div>
                </div>
                <div>
                    <div className="inv-label">Statut / Status</div>
                    <span className={`inv-badge ${invoice.status}`}>{invoice.status}</span>
                </div>
            </div>

            {/* Bill to */}
            <div className="inv-billto">
                <div className="inv-label">Facturé à / Bill to</div>
                <div><strong>{customer?.name}</strong></div>
                <div style={{ whiteSpace: "pre-line" }}>{customer?.billing_address}</div>
                {customer?.type === "B2B" && customer?.vat_number && (
                    <div>TVA : {customer.vat_number}</div>
                )}
            </div>

            {/* Headline */}
            <div className="inv-headline">
                {isCancelled
                    ? "Facture annulée / Cancelled invoice"
                    : isPaid
                        ? `Payée / Paid : ${formatMoney(totalTtc)}`
                        : `${formatMoney(amountDue)} à payer avant le ${fmtDate(invoice.due_date)}`}
            </div>
            {/* Lines */}
            <table className="inv-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qté / Qty</th>
                        <th>Prix unitaire HT</th>
                        <th>TVA</th>
                        <th>Montant HT</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            {sub?.material?.name}
                            <span className="inv-sub">
                                {fmtDate(invoice.consumption_start)} - {fmtDate(invoice.consumption_end)}
                            </span>
                        </td>
                        <td>{sub?.quantity}</td>
                        <td>{formatMoney(sub?.unit_price)}</td>
                        <td>{Math.round(VAT_RATE * 100)}%</td>
                        <td>{formatMoney(totalHt)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Summary */}
            <div className="inv-summary">
                <div className="inv-row"><span>Sous-total HT</span><span>{formatMoney(totalHt)}</span></div>
                <div className="inv-row">
                    <span>TVA ({Math.round(VAT_RATE * 100)}% sur {formatMoney(totalHt)})</span>
                    <span>{formatMoney(vatAmount)}</span>
                </div>
                <div className="inv-row total"><span>Total TTC</span><span>{formatMoney(totalTtc)}</span></div>

                {billings.length > 0 && (
                    <div className="inv-payments">
                        <div className="inv-label">Règlements / Payments</div>
                        {billings.map((b) => (
                            <div className="inv-row" key={b.id}>
                                <span>{MODE_LABEL[b.payment_mode] ?? b.payment_mode} · {fmtDate(b.payment_date)}</span>
                                <span>- {formatMoney(b.amount)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="inv-row due">
                    <span>Reste à payer / Amount due</span>
                    <span>{formatMoney(amountDue)}</span>
                </div>
            </div>

            <div className="inv-spacer" />

            {/* Footer */}
            <div className="inv-footer">
                <div className="inv-bank">
                    <strong>Coordonnées bancaires :</strong> {BANK.holder} · {BANK.bank} · {BANK.iban}
                </div>
                <div>Merci pour votre confiance. / Thank you for your business.</div>
                {customer?.type === "B2B" && (
                    <div>
                        En cas de retard de paiement, des pénalités pourront être appliquées conformément à la
                        législation en vigueur. [Mentions légales B2B à compléter]
                    </div>
                )}
                <div className="inv-page">Page 1 / 1</div>
            </div>
        </div>
    );
}