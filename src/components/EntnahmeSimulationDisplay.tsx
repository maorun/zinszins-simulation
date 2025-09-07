import { Table } from "./temp-rsuite-stubs";
import { formatCurrency } from "../utils/currency";
import type { WithdrawalResult } from "../../helpers/withdrawal";
import type { WithdrawalFormValue, ComparisonStrategy } from "../utils/config-storage";

const { Column, HeaderCell, Cell } = Table;

// Info icon component for calculation explanations
const InfoIcon = ({ onClick }: { onClick: () => void }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ 
      marginLeft: '0.5rem', 
      cursor: 'pointer', 
      color: '#1976d2',
      verticalAlign: 'middle'
    }}
    onClick={onClick}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
    <path d="M12,17h.01"></path>
  </svg>
);

// Helper function for strategy display names
function getStrategyDisplayName(strategy: string): string {
  switch (strategy) {
    case "4prozent":
      return "4% Regel";
    case "3prozent":
      return "3% Regel";
    case "variabel_prozent":
      return "Variable Prozent";
    case "monatlich_fest":
      return "Monatlich fest";
    case "dynamisch":
      return "Dynamische Strategie";
    default:
      return strategy;
  }
}

// Type for comparison results
type ComparisonResult = {
  strategy: ComparisonStrategy;
  finalCapital: number;
  totalWithdrawal: number;
  averageAnnualWithdrawal: number;
  duration: number | string;
};

interface EntnahmeSimulationDisplayProps {
  withdrawalData: {
    startingCapital: number;
    withdrawalArray: any[];
    withdrawalResult: WithdrawalResult;
    duration: number | null;
  } | null;
  formValue: WithdrawalFormValue;
  useComparisonMode: boolean;
  comparisonResults: ComparisonResult[];
  useSegmentedWithdrawal: boolean;
  withdrawalSegments: any[];
  onCalculationInfoClick: (explanationType: string, rowData: any) => void;
}

export function EntnahmeSimulationDisplay({
  withdrawalData,
  formValue,
  useComparisonMode,
  comparisonResults,
  useSegmentedWithdrawal,
  withdrawalSegments,
  onCalculationInfoClick,
}: EntnahmeSimulationDisplayProps) {
  if (!withdrawalData) {
    return (
      <div>
        <p>
          Keine Daten verfügbar. Bitte stelle sicher, dass Sparpläne
          definiert sind und eine Simulation durchgeführt wurde.
        </p>
      </div>
    );
  }

  if (useComparisonMode) {
    return (
      <div>
        <h4>Strategien-Vergleich</h4>
        <p>
          <strong>Startkapital bei Entnahme:</strong>{" "}
          {formatCurrency(withdrawalData.startingCapital)}
        </p>

        {/* Base strategy summary */}
        <div
          style={{
            border: "2px solid #1675e0",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "#f8f9ff",
          }}
        >
          <h5 style={{ color: "#1675e0", margin: "0 0 10px 0" }}>
            📊 Basis-Strategie:{" "}
            {getStrategyDisplayName(formValue.strategie)}
          </h5>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
            }}
          >
            <div>
              <strong>Rendite:</strong> {formValue.rendite}%
            </div>
            <div>
              <strong>Endkapital:</strong>{" "}
              {formatCurrency(
                withdrawalData.withdrawalArray[0]?.endkapital || 0,
              )}
            </div>
            <div>
              <strong>Vermögen reicht für:</strong>{" "}
              {withdrawalData.duration
                ? `${withdrawalData.duration} Jahr${withdrawalData.duration === 1 ? "" : "e"}`
                : "unbegrenzt"}
            </div>
            {formValue.strategie === "4prozent" ||
            formValue.strategie === "3prozent" ? (
              <div>
                <strong>Jährliche Entnahme:</strong>{" "}
                {formatCurrency(
                  withdrawalData.startingCapital *
                    (formValue.strategie === "4prozent" ? 0.04 : 0.03),
                )}
              </div>
            ) : formValue.strategie === "variabel_prozent" ? (
              <div>
                <strong>Jährliche Entnahme:</strong>{" "}
                {formatCurrency(
                  withdrawalData.startingCapital *
                    (formValue.variabelProzent / 100),
                )}
              </div>
            ) : formValue.strategie === "monatlich_fest" ? (
              <div>
                <strong>Monatliche Entnahme:</strong>{" "}
                {formatCurrency(formValue.monatlicheBetrag)}
              </div>
            ) : formValue.strategie === "dynamisch" ? (
              <div>
                <strong>Basis-Entnahme:</strong>{" "}
                {formatCurrency(
                  withdrawalData.startingCapital *
                    (formValue.dynamischBasisrate / 100),
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Comparison strategies results */}
        <h5>🔍 Vergleichs-Strategien</h5>
        {comparisonResults.length > 0 ? (
          <div style={{ display: "grid", gap: "15px" }}>
            {comparisonResults.map(
              (result: ComparisonResult, _index: number) => (
                <div
                  key={result.strategy.id}
                  style={{
                    border: "1px solid #e5e5ea",
                    borderRadius: "6px",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <h6 style={{ margin: "0 0 10px 0", color: "#666" }}>
                    {result.strategy.name} ({result.strategy.rendite}%
                    Rendite)
                  </h6>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "10px",
                      fontSize: "14px",
                    }}
                  >
                    <div>
                      <strong>Endkapital:</strong>{" "}
                      {formatCurrency(result.finalCapital)}
                    </div>
                    <div>
                      <strong>Gesamt-Entnahme:</strong>{" "}
                      {formatCurrency(result.totalWithdrawal)}
                    </div>
                    <div>
                      <strong>Ø Jährlich:</strong>{" "}
                      {formatCurrency(result.averageAnnualWithdrawal)}
                    </div>
                    <div>
                      <strong>Dauer:</strong>{" "}
                      {typeof result.duration === "number"
                        ? `${result.duration} Jahre`
                        : result.duration}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            Keine Vergleichs-Strategien konfiguriert. Fügen Sie
            Strategien über den Konfigurationsbereich hinzu.
          </p>
        )}

        {/* Comparison summary table */}
        {comparisonResults.length > 0 && (
          <div style={{ marginTop: "30px" }}>
            <h5>📋 Vergleichstabelle</h5>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #e5e5ea",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "left",
                      }}
                    >
                      Strategie
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "right",
                      }}
                    >
                      Rendite
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "right",
                      }}
                    >
                      Endkapital
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "right",
                      }}
                    >
                      Ø Jährliche Entnahme
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "right",
                      }}
                    >
                      Vermögen reicht für
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Base strategy row */}
                  <tr
                    style={{
                      backgroundColor: "#f8f9ff",
                      fontWeight: "bold",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                      }}
                    >
                      📊 {getStrategyDisplayName(formValue.strategie)}{" "}
                      (Basis)
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "right",
                      }}
                    >
                      {formValue.rendite}%
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(
                        withdrawalData.withdrawalArray[0]?.endkapital ||
                          0,
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "right",
                      }}
                    >
                      {(() => {
                        const totalWithdrawal =
                          withdrawalData.withdrawalArray.reduce(
                            (sum, year) => sum + year.entnahme,
                            0,
                          );
                        const averageAnnual =
                          totalWithdrawal /
                          withdrawalData.withdrawalArray.length;
                        return formatCurrency(averageAnnual);
                      })()}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #e5e5ea",
                        textAlign: "right",
                      }}
                    >
                      {withdrawalData.duration
                        ? `${withdrawalData.duration} Jahre`
                        : "unbegrenzt"}
                    </td>
                  </tr>
                  {/* Comparison strategies rows */}
                  {comparisonResults.map((result: ComparisonResult) => (
                    <tr key={result.strategy.id}>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #e5e5ea",
                        }}
                      >
                        {result.strategy.name}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #e5e5ea",
                          textAlign: "right",
                        }}
                      >
                        {result.strategy.rendite}%
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #e5e5ea",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(result.finalCapital)}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #e5e5ea",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(result.averageAnnualWithdrawal)}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #e5e5ea",
                          textAlign: "right",
                        }}
                      >
                        {typeof result.duration === "number"
                          ? `${result.duration} Jahre`
                          : result.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular single strategy simulation results
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h4>Entnahme-Simulation</h4>
        <p>
          <strong>Startkapital bei Entnahme:</strong>{" "}
          {formatCurrency(withdrawalData.startingCapital)}
        </p>
        {formValue.strategie === "monatlich_fest" ? (
          <>
            <p>
              <strong>Monatliche Entnahme (Basis):</strong>{" "}
              {formatCurrency(formValue.monatlicheBetrag)}
            </p>
            <p>
              <strong>Jährliche Entnahme (Jahr 1):</strong>{" "}
              {formatCurrency(formValue.monatlicheBetrag * 12)}
            </p>
            {formValue.guardrailsAktiv && (
              <p>
                <strong>Dynamische Anpassung:</strong> Aktiviert
                (Schwelle: {formValue.guardrailsSchwelle}%)
              </p>
            )}
          </>
        ) : formValue.strategie === "variabel_prozent" ? (
          <p>
            <strong>
              Jährliche Entnahme ({formValue.variabelProzent} Prozent
              Regel):
            </strong>{" "}
            {formatCurrency(
              withdrawalData.startingCapital *
                (formValue.variabelProzent / 100),
            )}
          </p>
        ) : formValue.strategie === "dynamisch" ? (
          <>
            <p>
              <strong>Basis-Entnahmerate:</strong>{" "}
              {formValue.dynamischBasisrate}%
            </p>
            <p>
              <strong>Jährliche Basis-Entnahme:</strong>{" "}
              {formatCurrency(
                withdrawalData.startingCapital *
                  (formValue.dynamischBasisrate / 100),
              )}
            </p>
            <p>
              <strong>Obere Schwelle:</strong>{" "}
              {formValue.dynamischObereSchwell}% Rendite →{" "}
              {formValue.dynamischObereAnpassung > 0 ? "+" : ""}
              {formValue.dynamischObereAnpassung}% Anpassung
            </p>
            <p>
              <strong>Untere Schwelle:</strong>{" "}
              {formValue.dynamischUntereSchwell}% Rendite →{" "}
              {formValue.dynamischUntereAnpassung}% Anpassung
            </p>
          </>
        ) : (
          <p>
            <strong>
              Jährliche Entnahme (
              {formValue.strategie === "4prozent"
                ? "4 Prozent"
                : "3 Prozent"}{" "}
              Regel):
            </strong>{" "}
            {formatCurrency(
              withdrawalData.startingCapital *
                (formValue.strategie === "4prozent" ? 0.04 : 0.03),
            )}
          </p>
        )}
        {formValue.inflationAktiv && (
          <p>
            <strong>Inflationsrate:</strong>{" "}
            {formValue.inflationsrate}% p.a. (Entnahmebeträge werden
            jährlich angepasst)
          </p>
        )}
        <p>
          <strong>Erwartete Rendite:</strong> {formValue.rendite}{" "}
          Prozent p.a.
        </p>
        {(() => {
          // Show Grundfreibetrag information for segmented withdrawal
          if (useSegmentedWithdrawal) {
            const segmentsWithGrundfreibetrag = withdrawalSegments.filter(segment => segment.enableGrundfreibetrag);
            if (segmentsWithGrundfreibetrag.length > 0) {
              return (
                <div>
                  <strong>Grundfreibetrag-Phasen:</strong>
                  {segmentsWithGrundfreibetrag.map((segment, _index) => {
                    const grundfreibetragAmount = segment.grundfreibetragPerYear?.[segment.startYear] || 10908;
                    const incomeTaxRate = (segment.incomeTaxRate || 0.18) * 100;
                    return (
                      <div key={segment.id} style={{ marginLeft: '10px', fontSize: '14px' }}>
                        • {segment.name} ({segment.startYear}-{segment.endYear}): {formatCurrency(grundfreibetragAmount)} pro Jahr (Einkommensteuersatz: {incomeTaxRate.toFixed(0)}%)
                      </div>
                    );
                  })}
                </div>
              );
            }
            return null;
          } else if (formValue.grundfreibetragAktiv) {
            return (
              <p>
                <strong>Grundfreibetrag:</strong>{" "}
                {formatCurrency(formValue.grundfreibetragBetrag)} pro Jahr
                (Einkommensteuersatz: {formValue.einkommensteuersatz}%)
              </p>
            );
          }
          return null;
        })()}
        <p>
          <strong>Vermögen reicht für:</strong>{" "}
          {withdrawalData.duration
            ? `${withdrawalData.duration} Jahr${withdrawalData.duration === 1 ? "" : "e"}`
            : "unbegrenzt (Vermögen wächst weiter)"}
        </p>
      </div>

      {/* Card Layout for All Devices */}
      <div>
        <div className="sparplan-cards">
          {withdrawalData.withdrawalArray.map((rowData, index) => (
            <div key={index} className="sparplan-card">
              <div className="sparplan-card-header">
                <span className="sparplan-year">
                  📅 {rowData.year}
                </span>
                <span className="sparplan-endkapital">
                  🎯 {formatCurrency(rowData.endkapital)}
                </span>
              </div>
              <div className="sparplan-card-details">
                <div className="sparplan-detail">
                  <span className="detail-label">
                    💰 Startkapital:
                  </span>
                  <span
                    className="detail-value"
                    style={{ color: "#28a745" }}
                  >
                    {formatCurrency(rowData.startkapital)}
                  </span>
                </div>
                <div className="sparplan-detail">
                  <span className="detail-label">💸 Entnahme:</span>
                  <span
                    className="detail-value"
                    style={{ color: "#dc3545" }}
                  >
                    {formatCurrency(rowData.entnahme)}
                  </span>
                </div>
                {formValue.strategie === "monatlich_fest" &&
                  rowData.monatlicheEntnahme && (
                    <div className="sparplan-detail">
                      <span className="detail-label">
                        📅 Monatlich:
                      </span>
                      <span
                        className="detail-value"
                        style={{ color: "#6f42c1" }}
                      >
                        {formatCurrency(rowData.monatlicheEntnahme)}
                      </span>
                    </div>
                  )}
                {formValue.inflationAktiv &&
                  rowData.inflationAnpassung !== undefined && (
                    <div className="sparplan-detail">
                      <span className="detail-label">
                        📈 Inflation:
                      </span>
                      <span
                        className="detail-value"
                        style={{ color: "#fd7e14", display: 'flex', alignItems: 'center' }}
                      >
                        {formatCurrency(rowData.inflationAnpassung)}
                        <InfoIcon onClick={() => onCalculationInfoClick('inflation', rowData)} />
                      </span>
                    </div>
                  )}
                {formValue.strategie === "monatlich_fest" &&
                  formValue.guardrailsAktiv &&
                  rowData.portfolioAnpassung !== undefined && (
                    <div className="sparplan-detail">
                      <span className="detail-label">
                        🛡️ Guardrails:
                      </span>
                      <span
                        className="detail-value"
                        style={{ color: "#20c997" }}
                      >
                        {formatCurrency(rowData.portfolioAnpassung)}
                      </span>
                    </div>
                  )}
                <div className="sparplan-detail">
                  <span className="detail-label">📈 Zinsen:</span>
                  <span
                    className="detail-value"
                    style={{ color: "#17a2b8", display: 'flex', alignItems: 'center' }}
                  >
                    {formatCurrency(rowData.zinsen)}
                    <InfoIcon onClick={() => onCalculationInfoClick('interest', rowData)} />
                  </span>
                </div>
                <div className="sparplan-detail">
                  <span className="detail-label">
                    💳 Bezahlte Steuer:
                  </span>
                  <span
                    className="detail-value"
                    style={{ color: "#dc3545", display: 'flex', alignItems: 'center' }}
                  >
                    {formatCurrency(rowData.bezahlteSteuer)}
                    <InfoIcon onClick={() => onCalculationInfoClick('tax', rowData)} />
                  </span>
                </div>
                {rowData.vorabpauschale !== undefined && rowData.vorabpauschale > 0 && (
                  <div className="sparplan-detail">
                    <span className="detail-label">
                      📊 Vorabpauschale:
                    </span>
                    <span
                      className="detail-value"
                      style={{ color: "#ff6b6b", display: 'flex', alignItems: 'center' }}
                    >
                      {formatCurrency(rowData.vorabpauschale)}
                      <InfoIcon onClick={() => onCalculationInfoClick('vorabpauschale', rowData)} />
                    </span>
                  </div>
                )}
                <div className="sparplan-detail">
                  <span className="detail-label">
                    🎯 Genutzter Freibetrag:
                  </span>
                  <span
                    className="detail-value"
                    style={{ color: "#28a745" }}
                  >
                    {formatCurrency(rowData.genutzterFreibetrag)}
                  </span>
                </div>
                {(() => {
                  // Check if Grundfreibetrag is enabled for this year
                  const isGrundfreibetragEnabled = useSegmentedWithdrawal 
                    ? withdrawalSegments.some(segment => 
                        rowData.year >= segment.startYear && 
                        rowData.year <= segment.endYear && 
                        segment.enableGrundfreibetrag
                      )
                    : formValue.grundfreibetragAktiv;
                  
                  return isGrundfreibetragEnabled && rowData.einkommensteuer !== undefined && (
                    <div className="sparplan-detail">
                      <span className="detail-label">
                        🏛️ Einkommensteuer:
                      </span>
                      <span
                        className="detail-value"
                        style={{ color: "#e83e8c", display: 'flex', alignItems: 'center' }}
                      >
                        {formatCurrency(rowData.einkommensteuer)}
                        <InfoIcon onClick={() => onCalculationInfoClick('incomeTax', rowData)} />
                      </span>
                    </div>
                  );
                })()}
                {(() => {
                  // Check if Grundfreibetrag is enabled for this year
                  const isGrundfreibetragEnabled = useSegmentedWithdrawal 
                    ? withdrawalSegments.some(segment => 
                        rowData.year >= segment.startYear && 
                        rowData.year <= segment.endYear && 
                        segment.enableGrundfreibetrag
                      )
                    : formValue.grundfreibetragAktiv;
                  
                  return isGrundfreibetragEnabled && rowData.genutzterGrundfreibetrag !== undefined && (
                    <div className="sparplan-detail">
                      <span className="detail-label">
                        🆓 Grundfreibetrag:
                      </span>
                      <span
                        className="detail-value"
                        style={{ color: "#28a745", display: 'flex', alignItems: 'center' }}
                      >
                        {formatCurrency(
                          rowData.genutzterGrundfreibetrag,
                        )}
                        <InfoIcon onClick={() => onCalculationInfoClick('incomeTax', rowData)} />
                      </span>
                    </div>
                  );
                })()}
                {/* New section for taxable income */}
                <div className="sparplan-detail">
                  <span className="detail-label">
                    💰 Zu versteuerndes Einkommen:
                  </span>
                  <span
                    className="detail-value"
                    style={{ color: "#6c757d", display: 'flex', alignItems: 'center' }}
                  >
                    {(() => {
                      // Calculate taxable income based on segment-specific or form settings
                      const grundfreibetragAmount = useSegmentedWithdrawal 
                        ? (() => {
                            const applicableSegment = withdrawalSegments.find(segment => 
                              rowData.year >= segment.startYear && rowData.year <= segment.endYear
                            );
                            return applicableSegment?.enableGrundfreibetrag 
                              ? (applicableSegment.grundfreibetragPerYear?.[rowData.year] || 10908)
                              : 0;
                          })()
                        : (formValue.grundfreibetragAktiv ? (formValue.grundfreibetragBetrag || 10908) : 0);
                      
                      return formatCurrency(Math.max(0, rowData.entnahme - grundfreibetragAmount));
                    })()}
                    <InfoIcon onClick={() => onCalculationInfoClick('taxableIncome', rowData)} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Desktop Table Layout */}
      <div style={{ display: "none" }}>
        <div className="table-container">
          <Table
            autoHeight
            data={withdrawalData.withdrawalArray}
            bordered
            rowHeight={60}
          >
            <Column width={100}>
              <HeaderCell>Jahr</HeaderCell>
              <Cell dataKey="year" />
            </Column>
            <Column width={120}>
              <HeaderCell>Startkapital</HeaderCell>
              <Cell>
                {(rowData: any) => formatCurrency(rowData.startkapital)}
              </Cell>
            </Column>
            <Column width={120}>
              <HeaderCell>Entnahme</HeaderCell>
              <Cell>
                {(rowData: any) => formatCurrency(rowData.entnahme)}
              </Cell>
            </Column>
            {formValue.strategie === "monatlich_fest" && (
              <Column width={120}>
                <HeaderCell>Monatlich</HeaderCell>
                <Cell>
                  {(rowData: any) =>
                    rowData.monatlicheEntnahme
                      ? formatCurrency(rowData.monatlicheEntnahme)
                      : "-"
                  }
                </Cell>
              </Column>
            )}
            {formValue.inflationAktiv && (
              <Column width={120}>
                <HeaderCell>Inflation</HeaderCell>
                <Cell>
                  {(rowData: any) =>
                    rowData.inflationAnpassung !== undefined
                      ? formatCurrency(rowData.inflationAnpassung)
                      : "-"
                  }
                </Cell>
              </Column>
            )}
            {formValue.strategie === "monatlich_fest" &&
              formValue.guardrailsAktiv && (
                <Column width={120}>
                  <HeaderCell>Guardrails</HeaderCell>
                  <Cell>
                    {(rowData: any) =>
                      rowData.portfolioAnpassung !== undefined
                        ? formatCurrency(rowData.portfolioAnpassung)
                        : "-"
                    }
                  </Cell>
                </Column>
              )}
            {formValue.strategie === "dynamisch" && (
              <>
                <Column width={100}>
                  <HeaderCell>Vorjahres-Rendite</HeaderCell>
                  <Cell>
                    {(rowData: any) =>
                      rowData.vorjahresRendite !== undefined
                        ? `${(rowData.vorjahresRendite * 100).toFixed(1)}%`
                        : "-"
                    }
                  </Cell>
                </Column>
                <Column width={120}>
                  <HeaderCell>Dynamische Anpassung</HeaderCell>
                  <Cell>
                    {(rowData: any) =>
                      rowData.dynamischeAnpassung !== undefined
                        ? formatCurrency(rowData.dynamischeAnpassung)
                        : "-"
                    }
                  </Cell>
                </Column>
              </>
            )}
            <Column width={100}>
              <HeaderCell>Zinsen</HeaderCell>
              <Cell>
                {(rowData: any) => formatCurrency(rowData.zinsen)}
              </Cell>
            </Column>
            <Column width={120}>
              <HeaderCell>bezahlte Steuer</HeaderCell>
              <Cell>
                {(rowData: any) => formatCurrency(rowData.bezahlteSteuer)}
              </Cell>
            </Column>
            <Column width={120}>
              <HeaderCell>Vorabpauschale</HeaderCell>
              <Cell>
                {(rowData: any) =>
                  rowData.vorabpauschale !== undefined && rowData.vorabpauschale > 0
                    ? formatCurrency(rowData.vorabpauschale)
                    : "-"
                }
              </Cell>
            </Column>
            {(() => {
              // Check if any segments or form has Grundfreibetrag enabled
              const isGrundfreibetragEnabled = useSegmentedWithdrawal 
                ? withdrawalSegments.some(segment => segment.enableGrundfreibetrag)
                : formValue.grundfreibetragAktiv;
              
              return isGrundfreibetragEnabled && (
                <Column width={120}>
                  <HeaderCell>Einkommensteuer</HeaderCell>
                  <Cell>
                    {(rowData: any) =>
                      rowData.einkommensteuer !== undefined
                        ? formatCurrency(rowData.einkommensteuer)
                        : "-"
                    }
                  </Cell>
                </Column>
              );
            })()}
            {(() => {
              // Check if any segments or form has Grundfreibetrag enabled
              const isGrundfreibetragEnabled = useSegmentedWithdrawal 
                ? withdrawalSegments.some(segment => segment.enableGrundfreibetrag)
                : formValue.grundfreibetragAktiv;
              
              return isGrundfreibetragEnabled && (
                <Column width={140}>
                  <HeaderCell>Grundfreibetrag genutzt</HeaderCell>
                  <Cell>
                    {(rowData: any) =>
                      rowData.genutzterGrundfreibetrag !== undefined
                        ? formatCurrency(
                            rowData.genutzterGrundfreibetrag,
                          )
                        : "-"
                    }
                  </Cell>
                </Column>
              );
            })()}
            <Column width={120}>
              <HeaderCell>Endkapital</HeaderCell>
              <Cell>
                {(rowData: any) => formatCurrency(rowData.endkapital)}
              </Cell>
            </Column>
          </Table>
        </div>
      </div>
    </div>
  );
}