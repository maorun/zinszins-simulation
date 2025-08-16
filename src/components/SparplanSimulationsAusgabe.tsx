import { Panel, Table } from "rsuite";
import type { SparplanElement } from "../utils/sparplan-utils";
import type { Summary } from "../utils/summary-utils";
import { fullSummary, getSparplanSummary } from "../utils/summary-utils";

const { Column, HeaderCell, Cell } = Table;



export function SparplanEnd({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const summary: Summary = fullSummary(elemente)
    return (
        <Panel header="🎯 Endkapital" bordered>
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
        </Panel>
    )
}

export function SparplanSimulationsAusgabe({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const summary: Summary = fullSummary(elemente)
    return (
        <Panel header="📈 Sparplan-Verlauf" bordered>
            <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                Detaillierte Aufschlüsselung Ihrer Sparpläne nach Jahren
            </div>
            <Table
                data={elemente?.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
                ).map((el) => ({
                    ...el,
                    zeitpunkt: new Date(el.start).toLocaleDateString('de-DE'),
                    zinsen: getSparplanSummary(el.simulation).zinsen.toFixed(2),
                    bezahlteSteuer: getSparplanSummary(
                        el.simulation
                    ).bezahlteSteuer.toFixed(2),
                    endkapital: getSparplanSummary(el.simulation).endkapital?.toFixed(2),
                }))}
                bordered
                headerHeight={70}
                style={{ fontSize: '0.9rem' }}
            >
                <Column width={120}>
                    <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa', textAlign: 'center' }}>
                        📅 Jahr
                    </HeaderCell>
                    <Cell dataKey="zeitpunkt" style={{ textAlign: 'center', fontWeight: 500 }} />
                </Column>

                <Column flexGrow={1}>
                    <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                        <HeaderSummary
                            title="💰 Einzahlung"
                            summary={summary.startkapital?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <EnhancedNumberCell dataKey="einzahlung" color="#28a745" />
                </Column>

                <Column flexGrow={1}>
                    <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                        <HeaderSummary
                            title="💸 Bezahlte Steuer"
                            summary={summary.bezahlteSteuer?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <EnhancedNumberCell dataKey="bezahlteSteuer" color="#dc3545" />
                </Column>
                
                <Column flexGrow={1}>
                    <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                        <HeaderSummary
                            title="📈 Zinsen"
                            summary={summary.zinsen?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <EnhancedNumberCell dataKey="zinsen" color="#17a2b8" />
                </Column>
                
                <Column flexGrow={1}>
                    <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                        <HeaderSummary
                            title="🎯 Endkapital"
                            summary={summary.endkapital?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <EnhancedNumberCell dataKey="endkapital" color="#2eabdf" bold />
                </Column>
            </Table>
        </Panel>
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

const NumberCell = ({
    rowData,
    dataKey,
    ...props
}: {
    rowData?: any;
    dataKey: string;
}) => <Cell {...props}>{thousands(rowData[dataKey])} €</Cell>;

const EnhancedNumberCell = ({
    rowData,
    dataKey,
    color = "#333",
    bold = false,
    ...props
}: {
    rowData?: any;
    dataKey: string;
    color?: string;
    bold?: boolean;
}) => (
    <Cell {...props} style={{ textAlign: 'right', paddingRight: '1rem' }}>
        <span style={{ 
            color, 
            fontWeight: bold ? 600 : 500,
            fontSize: bold ? '1rem' : '0.9rem'
        }}>
            {thousands(rowData[dataKey])} €
        </span>
    </Cell>
);

