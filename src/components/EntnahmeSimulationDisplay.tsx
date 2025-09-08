import { formatCurrency } from "../utils/currency";
import type { WithdrawalResult } from "../../helpers/withdrawal";
import type { WithdrawalFormValue, ComparisonStrategy } from "../utils/config-storage";
import { WithdrawalComparisonDisplay } from "./WithdrawalComparisonDisplay";

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
  // Global Grundfreibetrag configuration
  grundfreibetragAktiv?: boolean;
  grundfreibetragBetrag?: number;
}

export function EntnahmeSimulationDisplay({
  withdrawalData,
  formValue,
  useComparisonMode,
  comparisonResults,
  useSegmentedWithdrawal,
  withdrawalSegments,
  onCalculationInfoClick,
  grundfreibetragAktiv,
  grundfreibetragBetrag,
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
      <WithdrawalComparisonDisplay
        withdrawalData={withdrawalData}
        formValue={formValue}
        comparisonResults={comparisonResults}
      />
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
          } else if (grundfreibetragAktiv && grundfreibetragBetrag) {
            return (
              <p>
                <strong>Grundfreibetrag:</strong>{" "}
                {formatCurrency(grundfreibetragBetrag)} pro Jahr
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

    </div>
  );
}