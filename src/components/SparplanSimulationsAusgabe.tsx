import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { SparplanElement } from "../utils/sparplan-utils";
import type { Summary } from "../utils/summary-utils";
import { fullSummary, getSparplanSummary } from "../utils/summary-utils";



export function SparplanEnd({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const summary: Summary = fullSummary(elemente)
    return (
        <Card>
            <CardHeader>
                <CardTitle>🎯 Endkapital</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    borderRadius: '12px',
                    margin: '1rem 0',
                    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                        Ihr Gesamtkapital
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-1px' }}>
                        {thousands(summary.endkapital.toFixed(2))} €
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function SparplanSimulationsAusgabe({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const summary: Summary = fullSummary(elemente)
    const tableData = elemente?.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
    ).map((el) => ({
        ...el,
        zeitpunkt: new Date(el.start).toLocaleDateString('de-DE'),
        zinsen: getSparplanSummary(el.simulation).zinsen.toFixed(2),
        bezahlteSteuer: getSparplanSummary(
            el.simulation
        ).bezahlteSteuer.toFixed(2),
        endkapital: getSparplanSummary(el.simulation).endkapital?.toFixed(2),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>📈 Sparplan-Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Detaillierte Aufschlüsselung Ihrer Sparpläne nach Jahren
                </div>
                
                {/* Card Layout for All Devices */}
                <div className="sparplan-cards">
                    {tableData?.map((el, index) => (
                        <div key={index} className="sparplan-card">
                            <div className="sparplan-card-header">
                                <span className="sparplan-year">📅 {el.zeitpunkt}</span>
                                <span className="sparplan-endkapital">
                                    🎯 {thousands(el.endkapital)} €
                                </span>
                            </div>
                            <div className="sparplan-card-details">
                                <div className="sparplan-detail">
                                    <span className="detail-label">💰 Einzahlung:</span>
                                    <span className="detail-value" style={{ color: '#28a745' }}>
                                        {thousands(el.einzahlung)} €
                                    </span>
                                </div>
                                <div className="sparplan-detail">
                                    <span className="detail-label">📈 Zinsen:</span>
                                    <span className="detail-value" style={{ color: '#17a2b8' }}>
                                        {thousands(el.zinsen)} €
                                    </span>
                                </div>
                                <div className="sparplan-detail">
                                    <span className="detail-label">💸 Bezahlte Steuer:</span>
                                    <span className="detail-value" style={{ color: '#dc3545' }}>
                                        {thousands(el.bezahlteSteuer)} €
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Summary Card */}
                    <div className="sparplan-summary-card">
                        <div className="summary-title">📊 Gesamtübersicht</div>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-label">💰 Einzahlungen</span>
                                <span className="summary-value">
                                    {thousands(summary.startkapital?.toFixed(2) || "0")} €
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">📈 Zinsen</span>
                                <span className="summary-value">
                                    {thousands(summary.zinsen?.toFixed(2) || "0")} €
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">💸 Steuern</span>
                                <span className="summary-value">
                                    {thousands(summary.bezahlteSteuer?.toFixed(2) || "0")} €
                                </span>
                            </div>
                            <div className="summary-item highlight">
                                <span className="summary-label">🎯 Endkapital</span>
                                <span className="summary-value">
                                    {thousands(summary.endkapital?.toFixed(2) || "0")} €
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden Desktop Table Layout */}
                <div style={{ display: 'none' }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center font-semibold">📅 Jahr</TableHead>
                                <TableHead className="font-semibold">
                                    <HeaderSummary
                                        title="💰 Einzahlung"
                                        summary={summary.startkapital?.toFixed(2).toString() || ""}
                                    />
                                </TableHead>
                                <TableHead className="font-semibold">
                                    <HeaderSummary
                                        title="💸 Bezahlte Steuer"
                                        summary={summary.bezahlteSteuer?.toFixed(2).toString() || ""}
                                    />
                                </TableHead>
                                <TableHead className="font-semibold">
                                    <HeaderSummary
                                        title="📈 Zinsen"
                                        summary={summary.zinsen?.toFixed(2).toString() || ""}
                                    />
                                </TableHead>
                                <TableHead className="font-semibold">
                                    <HeaderSummary
                                        title="🎯 Endkapital"
                                        summary={summary.endkapital?.toFixed(2).toString() || ""}
                                    />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData?.map((el, index) => (
                                <TableRow key={index}>
                                    <TableCell className="text-center font-medium">{el.zeitpunkt}</TableCell>
                                    <TableCell className="text-right">
                                        <span style={{ color: '#28a745', fontWeight: 500 }}>
                                            {thousands(el.einzahlung)} €
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span style={{ color: '#dc3545', fontWeight: 500 }}>
                                            {thousands(el.bezahlteSteuer)} €
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span style={{ color: '#17a2b8', fontWeight: 500 }}>
                                            {thousands(el.zinsen)} €
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span style={{ color: '#2eabdf', fontWeight: 600, fontSize: '1rem' }}>
                                            {thousands(el.endkapital)} €
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

const thousands = (value: string) =>
    Number(`${value}`).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const HeaderSummary = ({
    title,
    summary,
}: {
    title: string;
    summary: string;
}) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            {title}
        </div>
        <div style={{
            fontSize: '1.1rem',
            color: "#2eabdf",
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2eabdf, #17a2b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        }}>
            {thousands(summary)} €
        </div>
    </div>
);

