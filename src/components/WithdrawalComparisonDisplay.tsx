import { formatCurrency } from "../utils/currency";
import type { WithdrawalResult } from "../../helpers/withdrawal";
import type { WithdrawalFormValue, ComparisonStrategy } from "../utils/config-storage";

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

interface WithdrawalComparisonDisplayProps {
  withdrawalData: {
    startingCapital: number;
    withdrawalArray: any[];
    withdrawalResult: WithdrawalResult;
    duration: number | null;
  };
  formValue: WithdrawalFormValue;
  comparisonResults: ComparisonResult[];
}

export function WithdrawalComparisonDisplay({
  withdrawalData,
  formValue,
  comparisonResults,
}: WithdrawalComparisonDisplayProps) {
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