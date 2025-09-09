import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown } from "lucide-react";
import { RadioTileGroup, RadioTile } from "./ui/radio-tile";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

// Temporary components still from stubs
import {
  Form,
  InputNumber,
  Toggle,
  Slider,
} from "./temp-rsuite-stubs";
import type { SparplanElement } from "../utils/sparplan-utils";
import type {
  WithdrawalStrategy,
  WithdrawalResult,
} from "../../helpers/withdrawal";
import { createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import { WithdrawalSegmentForm } from "./WithdrawalSegmentForm";
import { DynamicWithdrawalConfiguration } from "./DynamicWithdrawalConfiguration";
import { EntnahmeSimulationDisplay } from "./EntnahmeSimulationDisplay";
import { useWithdrawalConfig } from "../hooks/useWithdrawalConfig";
import { useWithdrawalCalculations } from "../hooks/useWithdrawalCalculations";
import { useWithdrawalModals } from "../hooks/useWithdrawalModals";
import CalculationExplanationModal from './CalculationExplanationModal';
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal';
import { useSimulation } from '../contexts/useSimulation';
import type {
  WithdrawalReturnMode,
  ComparisonStrategy,
} from "../utils/config-storage";

// Helper function for strategy display names
function getStrategyDisplayName(strategy: WithdrawalStrategy): string {
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

export function EntnahmeSimulationsAusgabe({
  startEnd,
  elemente,
  dispatchEnd,
  onWithdrawalResultsChange,
  steuerlast,
  teilfreistellungsquote,
}: {
  startEnd: [number, number];
  elemente: SparplanElement[];
  dispatchEnd: (val: [number, number]) => void;
  onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void;
  steuerlast: number;
  teilfreistellungsquote: number;
}) {
  const [startOfIndependence, endOfLife] = startEnd;
  
  // Use custom hooks for state management
  const { currentConfig, updateConfig, updateFormValue, updateComparisonStrategy } = 
    useWithdrawalConfig(startOfIndependence, endOfLife);
  
  const { withdrawalData, comparisonResults } = useWithdrawalCalculations(
    elemente,
    startOfIndependence,
    currentConfig,
    steuerlast,
    teilfreistellungsquote,
  );

  // Access global Grundfreibetrag configuration
  const { grundfreibetragAktiv, grundfreibetragBetrag } = useSimulation();

  const {
    showCalculationModal,
    setShowCalculationModal,
    calculationDetails,
    showVorabpauschaleModal,
    setShowVorabpauschaleModal,
    selectedVorabDetails,
    handleCalculationInfoClick,
  } = useWithdrawalModals(
    currentConfig.formValue,
    currentConfig.useSegmentedWithdrawal,
    currentConfig.withdrawalSegments,
    withdrawalData,
    startOfIndependence,
    steuerlast,
    teilfreistellungsquote,
  );

  // Extract values from config for easier access
  const formValue = currentConfig.formValue;
  const withdrawalReturnMode = currentConfig.withdrawalReturnMode;
  const withdrawalVariableReturns = currentConfig.withdrawalVariableReturns;
  const withdrawalAverageReturn = currentConfig.withdrawalAverageReturn;
  const withdrawalStandardDeviation = currentConfig.withdrawalStandardDeviation;
  const withdrawalRandomSeed = currentConfig.withdrawalRandomSeed;
  const useSegmentedWithdrawal = currentConfig.useSegmentedWithdrawal;
  const withdrawalSegments = currentConfig.withdrawalSegments;
  const useComparisonMode = currentConfig.useComparisonMode;
  const comparisonStrategies = currentConfig.comparisonStrategies;

  // Notify parent component when withdrawal results change
  useEffect(() => {
    if (onWithdrawalResultsChange && withdrawalData) {
      onWithdrawalResultsChange(withdrawalData.withdrawalResult);
    }
  }, [withdrawalData, onWithdrawalResultsChange]);

  // Update withdrawal segments when startOfIndependence changes (for segmented withdrawal)
  useEffect(() => {
    if (useSegmentedWithdrawal && withdrawalSegments.length > 0) {
      // Update the start year of the first segment to match the new savings end
      const updatedSegments = withdrawalSegments.map((segment, index) => {
        if (index === 0) {
          // Update the first segment to start at the new withdrawal start year
          return {
            ...segment,
            startYear: startOfIndependence + 1,
          };
        }
        return segment;
      });

      // Only update if there's an actual change
      if (updatedSegments[0]?.startYear !== withdrawalSegments[0]?.startYear) {
        updateConfig({ withdrawalSegments: updatedSegments });
      }
    }
  }, [
    startOfIndependence,
    useSegmentedWithdrawal,
    withdrawalSegments,
    updateConfig,
  ]);

  return (
    <>
      <Card className="mb-4">
        <Collapsible defaultOpen={false}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                <CardTitle className="text-left">Variablen</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
        {/* Toggle between single, segmented, and comparison withdrawal */}
        <div className="mb-4 space-y-2">
          <Label>Entnahme-Modus</Label>
          <RadioTileGroup
            value={
              useComparisonMode
                ? "comparison"
                : useSegmentedWithdrawal
                  ? "segmented"
                  : "single"
            }
            onValueChange={(value: string) => {
              const useComparison = value === "comparison";
              const useSegmented = value === "segmented";

              updateConfig({
                useComparisonMode: useComparison,
                useSegmentedWithdrawal: useSegmented,
              });

              // Initialize segments when switching to segmented mode
              if (useSegmented && withdrawalSegments.length === 0) {
                const defaultSegment = createDefaultWithdrawalSegment(
                  "main",
                  "Hauptphase",
                  startOfIndependence + 1,
                  formValue.endOfLife,
                );
                updateConfig({ withdrawalSegments: [defaultSegment] });
              }
            }}
          >
            <RadioTile value="single" label="Einheitliche Strategie">
              Verwende eine einheitliche Strategie für die gesamte Entnahme-Phase
            </RadioTile>
            <RadioTile value="segmented" label="Geteilte Phasen">
              Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf
            </RadioTile>
            <RadioTile value="comparison" label="Strategien-Vergleich">
              Vergleiche verschiedene Entnahmestrategien miteinander
            </RadioTile>
          </RadioTileGroup>
          <div className="text-sm text-muted-foreground mt-1">
            {useComparisonMode
              ? "Vergleiche verschiedene Entnahmestrategien miteinander."
              : useSegmentedWithdrawal
                ? "Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf."
                : "Verwende eine einheitliche Strategie für die gesamte Entnahme-Phase."}
          </div>
        </div>

        {useSegmentedWithdrawal ? (
          /* Segmented withdrawal configuration */
          <WithdrawalSegmentForm
            segments={withdrawalSegments}
            onSegmentsChange={(segments) =>
              updateConfig({ withdrawalSegments: segments })
            }
            withdrawalStartYear={startOfIndependence + 1}
            withdrawalEndYear={formValue.endOfLife}
          />
        ) : useComparisonMode ? (
          /* Comparison mode configuration */
          <div>
            <h4>Basis-Strategie (mit vollständigen Details)</h4>
            <Form
              fluid
              formValue={formValue}
              onChange={(changedFormValue: any) => {
                dispatchEnd([startOfIndependence, changedFormValue.endOfLife]);
                updateFormValue({
                  endOfLife: changedFormValue.endOfLife,
                  strategie: changedFormValue.strategie,
                  withdrawalFrequency: changedFormValue.withdrawalFrequency,
                  rendite: changedFormValue.rendite,
                  inflationAktiv: changedFormValue.inflationAktiv,
                  inflationsrate: changedFormValue.inflationsrate,
                  monatlicheBetrag: changedFormValue.monatlicheBetrag,
                  guardrailsAktiv: changedFormValue.guardrailsAktiv,
                  guardrailsSchwelle: changedFormValue.guardrailsSchwelle,
                  variabelProzent: changedFormValue.variabelProzent,
                  dynamischBasisrate: changedFormValue.dynamischBasisrate,
                  dynamischObereSchwell: changedFormValue.dynamischObereSchwell,
                  dynamischObereAnpassung:
                    changedFormValue.dynamischObereAnpassung,
                  dynamischUntereSchwell:
                    changedFormValue.dynamischUntereSchwell,
                  dynamischUntereAnpassung:
                    changedFormValue.dynamischUntereAnpassung,
                  einkommensteuersatz: changedFormValue.einkommensteuersatz,
                });
              }}
            >
              {/* End of Life - shared by base strategy */}
              <Form.Group controlId="endOfLife">
                <Form.ControlLabel>End of Life</Form.ControlLabel>
                <Form.Control name="endOfLife" accepter={InputNumber} />
              </Form.Group>

              {/* Strategy selector - for base strategy only */}
              <Form.Group controlId="strategie">
                <Form.ControlLabel>Basis-Strategie</Form.ControlLabel>
                <Form.Control name="strategie" accepter={RadioTileGroup}>
                  <RadioTile value="4prozent" label="4% Regel">
                    4% Entnahme
                  </RadioTile>
                  <RadioTile value="3prozent" label="3% Regel">
                    3% Entnahme
                  </RadioTile>
                  <RadioTile value="variabel_prozent" label="Variable Prozent">
                    Anpassbare Entnahme
                  </RadioTile>
                  <RadioTile value="monatlich_fest" label="Monatlich fest">
                    Fester monatlicher Betrag
                  </RadioTile>
                  <RadioTile value="dynamisch" label="Dynamische Strategie">
                    Renditebasierte Anpassung
                  </RadioTile>
                </Form.Control>
              </Form.Group>

              {/* Withdrawal frequency configuration */}
              <Form.Group controlId="withdrawalFrequency">
                <Form.ControlLabel>Entnahme-Häufigkeit</Form.ControlLabel>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-sm">Jährlich</span>
                  <Switch
                    checked={formValue.withdrawalFrequency === "monthly"}
                    onCheckedChange={(checked) => {
                      updateFormValue({
                        withdrawalFrequency: checked ? "monthly" : "yearly",
                      });
                    }}
                  />
                  <span className="text-sm">Monatlich</span>
                </div>
                <Form.HelpText>
                  {formValue.withdrawalFrequency === "yearly" 
                    ? "Entnahme erfolgt einmal jährlich am Anfang des Jahres"
                    : "Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen"
                  }
                </Form.HelpText>
              </Form.Group>

              {/* Fixed return rate for base strategy */}
              <Form.Group controlId="rendite">
                <Form.ControlLabel>
                  Rendite Basis-Strategie (%)
                </Form.ControlLabel>
                <Form.Control
                  name="rendite"
                  accepter={Slider}
                  min={0}
                  max={10}
                  step={0.5}
                  handleTitle={
                    <div style={{ marginTop: "-17px" }}>
                      {formValue.rendite}%
                    </div>
                  }
                  progress
                  graduated
                />
              </Form.Group>

              {/* Strategy-specific configuration for base strategy */}
              {formValue.strategie === "variabel_prozent" && (
                <Form.Group controlId="variabelProzent">
                  <Form.ControlLabel>
                    Entnahme-Prozentsatz (%)
                  </Form.ControlLabel>
                  <Form.Control
                    name="variabelProzent"
                    accepter={Slider}
                    min={1}
                    max={10}
                    step={0.5}
                    handleTitle={
                      <div style={{ marginTop: "-17px" }}>
                        {formValue.variabelProzent}%
                      </div>
                    }
                    progress
                    graduated
                  />
                </Form.Group>
              )}

              {formValue.strategie === "monatlich_fest" && (
                <Form.Group controlId="monatlicheBetrag">
                  <Form.ControlLabel>Monatlicher Betrag (€)</Form.ControlLabel>
                  <Form.Control
                    name="monatlicheBetrag"
                    accepter={InputNumber}
                  />
                </Form.Group>
              )}

              {formValue.strategie === "dynamisch" && (
                <DynamicWithdrawalConfiguration formValue={formValue} />
              )}
            </Form>

            {/* Comparison strategies configuration */}
            <div style={{ marginTop: "30px" }}>
              <h4>Vergleichs-Strategien</h4>
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "20px",
                }}
              >
                Konfiguriere zusätzliche Strategien zum Vergleich. Diese zeigen
                nur die wichtigsten Parameter und Endergebnisse.
              </p>

              {comparisonStrategies.map(
                (strategy: ComparisonStrategy, index: number) => (
                  <div
                    key={strategy.id}
                    style={{
                      border: "1px solid #e5e5ea",
                      borderRadius: "6px",
                      padding: "15px",
                      marginBottom: "15px",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <h5 style={{ margin: 0 }}>
                        Strategie {index + 1}: {strategy.name}
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig({
                            comparisonStrategies: comparisonStrategies.filter(
                              (s: ComparisonStrategy) => s.id !== strategy.id,
                            ),
                          });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#999",
                          cursor: "pointer",
                          fontSize: "18px",
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px",
                        alignItems: "end",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginBottom: "5px",
                          }}
                        >
                          Strategie-Typ
                        </label>
                        <select
                          value={strategy.strategie}
                          onChange={(e) => {
                            const newStrategie = e.target
                              .value as WithdrawalStrategy;
                            updateComparisonStrategy(strategy.id, {
                              strategie: newStrategie,
                              name: getStrategyDisplayName(newStrategie),
                            });
                          }}
                          style={{
                            width: "100%",
                            padding: "6px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          <option value="4prozent">4% Regel</option>
                          <option value="3prozent">3% Regel</option>
                          <option value="variabel_prozent">
                            Variable Prozent
                          </option>
                          <option value="monatlich_fest">Monatlich fest</option>
                          <option value="dynamisch">
                            Dynamische Strategie
                          </option>
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginBottom: "5px",
                          }}
                        >
                          Rendite (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={strategy.rendite}
                          onChange={(e) => {
                            updateComparisonStrategy(strategy.id, {
                              rendite: parseFloat(e.target.value) || 0,
                            });
                          }}
                          style={{
                            width: "100%",
                            padding: "6px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        />
                      </div>

                      {/* Strategy-specific parameters */}
                      {strategy.strategie === "variabel_prozent" && (
                        <div style={{ gridColumn: "span 2" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "12px",
                              fontWeight: "bold",
                              marginBottom: "5px",
                            }}
                          >
                            Entnahme-Prozentsatz (%)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={strategy.variabelProzent || 5}
                            onChange={(e) => {
                              updateComparisonStrategy(strategy.id, {
                                variabelProzent:
                                  parseFloat(e.target.value) || 5,
                              });
                            }}
                            style={{
                              width: "50%",
                              padding: "6px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      )}

                      {strategy.strategie === "monatlich_fest" && (
                        <div style={{ gridColumn: "span 2" }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "12px",
                              fontWeight: "bold",
                              marginBottom: "5px",
                            }}
                          >
                            Monatlicher Betrag (€)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={strategy.monatlicheBetrag || 2000}
                            onChange={(e) => {
                              updateComparisonStrategy(strategy.id, {
                                monatlicheBetrag:
                                  parseFloat(e.target.value) || 2000,
                              });
                            }}
                            style={{
                              width: "50%",
                              padding: "6px",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      )}

                      {strategy.strategie === "dynamisch" && (
                        <>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: "12px",
                                fontWeight: "bold",
                                marginBottom: "5px",
                              }}
                            >
                              Basis-Rate (%)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              step="0.5"
                              value={strategy.dynamischBasisrate || 4}
                              onChange={(e) => {
                                updateComparisonStrategy(strategy.id, {
                                  dynamischBasisrate:
                                    parseFloat(e.target.value) || 4,
                                });
                              }}
                              style={{
                                width: "100%",
                                padding: "6px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: "12px",
                                fontWeight: "bold",
                                marginBottom: "5px",
                              }}
                            >
                              Obere Schwelle (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={strategy.dynamischObereSchwell || 8}
                              onChange={(e) => {
                                updateComparisonStrategy(strategy.id, {
                                  dynamischObereSchwell:
                                    parseFloat(e.target.value) || 8,
                                });
                              }}
                              style={{
                                width: "100%",
                                padding: "6px",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={() => {
                  const newId = `strategy${Date.now()}`;
                  const newStrategy: ComparisonStrategy = {
                    id: newId,
                    name: "3% Regel",
                    strategie: "3prozent",
                    rendite: 5,
                  };
                  updateConfig({
                    comparisonStrategies: [
                      ...comparisonStrategies,
                      newStrategy,
                    ],
                  });
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1675e0",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Weitere Strategie hinzufügen
              </button>
            </div>
          </div>
        ) : (
          /* Single strategy configuration (existing UI) */
          <Form
            fluid
            formValue={formValue}
            onChange={(changedFormValue: any) => {
              dispatchEnd([startOfIndependence, changedFormValue.endOfLife]);
              updateFormValue({
                endOfLife: changedFormValue.endOfLife,
                strategie: changedFormValue.strategie,
                withdrawalFrequency: changedFormValue.withdrawalFrequency,
                rendite: changedFormValue.rendite,
                inflationAktiv: changedFormValue.inflationAktiv,
                inflationsrate: changedFormValue.inflationsrate,
                monatlicheBetrag: changedFormValue.monatlicheBetrag,
                guardrailsAktiv: changedFormValue.guardrailsAktiv,
                guardrailsSchwelle: changedFormValue.guardrailsSchwelle,
                variabelProzent: changedFormValue.variabelProzent,
                dynamischBasisrate: changedFormValue.dynamischBasisrate,
                dynamischObereSchwell: changedFormValue.dynamischObereSchwell,
                dynamischObereAnpassung:
                  changedFormValue.dynamischObereAnpassung,
                dynamischUntereSchwell: changedFormValue.dynamischUntereSchwell,
                dynamischUntereAnpassung:
                  changedFormValue.dynamischUntereAnpassung,
                einkommensteuersatz: changedFormValue.einkommensteuersatz,
              });
            }}
          >
            {/* Withdrawal Return Configuration */}
            <div className="mb-4 space-y-2">
              <Label>Rendite-Konfiguration (Entnahme-Phase)</Label>
              <RadioTileGroup
                value={withdrawalReturnMode}
                onValueChange={(value: string) => {
                  updateConfig({
                    withdrawalReturnMode: value as WithdrawalReturnMode,
                  });
                }}
              >
                <RadioTile value="fixed" label="Feste Rendite">
                  Konstante jährliche Rendite für die gesamte Entnahme-Phase
                </RadioTile>
                <RadioTile value="random" label="Zufällige Rendite">
                  Monte Carlo Simulation mit Durchschnitt und Volatilität
                </RadioTile>
                <RadioTile value="variable" label="Variable Rendite">
                  Jahr-für-Jahr konfigurierbare Renditen
                </RadioTile>
              </RadioTileGroup>
              <div className="text-sm text-muted-foreground mt-1">
                Konfiguration der erwarteten Rendite während der Entnahme-Phase
                (unabhängig von der Sparphase-Rendite).
              </div>
            </div>

            {withdrawalReturnMode === "fixed" && (
              <Form.Group controlId="rendite">
                <Form.ControlLabel>
                  Erwartete Rendite Entnahme-Phase (%)
                </Form.ControlLabel>
                <Form.Control
                  name="rendite"
                  accepter={Slider}
                  min={0}
                  max={10}
                  step={0.5}
                  handleTitle={
                    <div style={{ marginTop: "-17px" }}>
                      {formValue.rendite}%
                    </div>
                  }
                  progress
                  graduated
                />
                <Form.HelpText>
                  Feste Rendite für die gesamte Entnahme-Phase (oft
                  konservativer als die Sparphase-Rendite).
                </Form.HelpText>
              </Form.Group>
            )}

            {withdrawalReturnMode === "random" && (
              <>
                <div className="mb-4 space-y-2">
                  <Label>Durchschnittliche Rendite (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[withdrawalAverageReturn]}
                      min={0}
                      max={12}
                      step={0.5}
                      onValueChange={(value) =>
                        updateConfig({ withdrawalAverageReturn: value[0] })
                      }
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0%</span>
                      <span className="font-medium text-gray-900">{withdrawalAverageReturn}%</span>
                      <span>12%</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Erwartete durchschnittliche Rendite für die Entnahme-Phase
                    (meist konservativer als Ansparphase)
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <Label>Standardabweichung (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[withdrawalStandardDeviation]}
                      min={5}
                      max={25}
                      step={1}
                      onValueChange={(value) =>
                        updateConfig({ withdrawalStandardDeviation: value[0] })
                      }
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>5%</span>
                      <span className="font-medium text-gray-900">{withdrawalStandardDeviation}%</span>
                      <span>25%</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Volatilität der Renditen (meist niedriger als Ansparphase
                    wegen konservativerer Allokation)
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <Label>Zufalls-Seed (optional)</Label>
                  <InputNumber
                    value={withdrawalRandomSeed}
                    onChange={(value: number | undefined) =>
                      updateConfig({
                        withdrawalRandomSeed:
                          typeof value === "number" ? value : undefined,
                      })
                    }
                    placeholder="Für reproduzierbare Ergebnisse"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Optionaler Seed für reproduzierbare Zufallsrenditen. Leer
                    lassen für echte Zufälligkeit.
                  </div>
                </div>
              </>
            )}

            {withdrawalReturnMode === "variable" && (
              <div className="mb-4 space-y-2">
                <Label>Variable Renditen pro Jahr (Entnahme-Phase)</Label>
                <div
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: "1px solid #e5e5ea",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  {Array.from(
                    { length: formValue.endOfLife - startOfIndependence },
                    (_, i) => {
                      const year = startOfIndependence + 1 + i;
                      return (
                        <div
                          key={year}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                            gap: "10px",
                          }}
                        >
                          <div style={{ minWidth: "60px", fontWeight: "bold" }}>
                            {year}:
                          </div>
                          <div style={{ flex: 1 }}>
                            <Slider
                              value={withdrawalVariableReturns[year] || 5}
                              min={-10}
                              max={15}
                              step={0.5}
                              onChange={(value: number) => {
                                const newReturns = {
                                  ...withdrawalVariableReturns,
                                  [year]: value,
                                };
                                updateConfig({
                                  withdrawalVariableReturns: newReturns,
                                });
                              }}
                            />
                          </div>
                          <div style={{ minWidth: "50px", textAlign: "right" }}>
                            {(withdrawalVariableReturns[year] || 5).toFixed(1)}%
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Tipp: Verwende niedrigere Werte für konservative
                  Portfolio-Allokation in der Rente und negative Werte für
                  Krisen-Jahre.
                </div>
              </div>
            )}
            <Form.Group controlId="endOfLife">
              <Form.ControlLabel>End of Life</Form.ControlLabel>
              <Form.Control name="endOfLife" accepter={InputNumber} />
            </Form.Group>
            <Form.Group controlId="strategie">
              <Form.ControlLabel>Strategie</Form.ControlLabel>
              <Form.Control name="strategie" accepter={RadioTileGroup}>
                <RadioTile value="4prozent" label="4% Regel">
                  4% Entnahme
                </RadioTile>
                <RadioTile value="3prozent" label="3% Regel">
                  3% Entnahme
                </RadioTile>
                <RadioTile value="variabel_prozent" label="Variable Prozent">
                  Anpassbare Entnahme
                </RadioTile>
                <RadioTile value="monatlich_fest" label="Monatlich fest">
                  Fester monatlicher Betrag
                </RadioTile>
                <RadioTile value="dynamisch" label="Dynamische Strategie">
                  Renditebasierte Anpassung
                </RadioTile>
              </Form.Control>
            </Form.Group>

            {/* Withdrawal frequency configuration */}
            <Form.Group controlId="withdrawalFrequency">
              <Form.ControlLabel>Entnahme-Häufigkeit</Form.ControlLabel>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-sm">Jährlich</span>
                <Switch
                  checked={formValue.withdrawalFrequency === "monthly"}
                  onCheckedChange={(checked) => {
                    updateFormValue({
                      withdrawalFrequency: checked ? "monthly" : "yearly",
                    });
                  }}
                />
                <span className="text-sm">Monatlich</span>
              </div>
              <Form.HelpText>
                {formValue.withdrawalFrequency === "yearly" 
                  ? "Entnahme erfolgt einmal jährlich am Anfang des Jahres"
                  : "Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen"
                }
              </Form.HelpText>
            </Form.Group>

            {/* General inflation controls for all strategies */}
            <Form.Group controlId="inflationAktiv">
              <Form.ControlLabel>Inflation berücksichtigen</Form.ControlLabel>
              <Form.Control name="inflationAktiv" accepter={Toggle} />
              <Form.HelpText>
                Passt die Entnahmebeträge jährlich an die Inflation an (für alle
                Entnahme-Strategien)
              </Form.HelpText>
            </Form.Group>

            {formValue.inflationAktiv && (
              <Form.Group controlId="inflationsrate">
                <Form.ControlLabel>Inflationsrate (%)</Form.ControlLabel>
                <Form.Control
                  name="inflationsrate"
                  accepter={Slider}
                  min={0}
                  max={5}
                  step={0.1}
                  handleTitle={
                    <div style={{ marginTop: "-17px" }}>
                      {formValue.inflationsrate}%
                    </div>
                  }
                  progress
                  graduated
                />
                <Form.HelpText>
                  Jährliche Inflationsrate zur Anpassung der Entnahmebeträge
                </Form.HelpText>
              </Form.Group>
            )}

            {/* Variable percentage strategy specific controls */}
            {formValue.strategie === "variabel_prozent" && (
              <Form.Group controlId="variabelProzent">
                <Form.ControlLabel>Entnahme-Prozentsatz (%)</Form.ControlLabel>
                <Form.Control
                  name="variabelProzent"
                  accepter={Slider}
                  min={2}
                  max={7}
                  step={0.5}
                  handleTitle={
                    <div style={{ marginTop: "-17px" }}>
                      {formValue.variabelProzent}%
                    </div>
                  }
                  progress
                  graduated
                />
                <Form.HelpText>
                  Wählen Sie einen Entnahme-Prozentsatz zwischen 2% und 7% in
                  0,5%-Schritten
                </Form.HelpText>
              </Form.Group>
            )}

            {/* Monthly strategy specific controls */}
            {formValue.strategie === "monatlich_fest" && (
              <>
                <Form.Group controlId="monatlicheBetrag">
                  <Form.ControlLabel>Monatlicher Betrag (€)</Form.ControlLabel>
                  <Form.Control
                    name="monatlicheBetrag"
                    accepter={InputNumber}
                    min={100}
                    max={50000}
                    step={100}
                  />
                </Form.Group>
                <Form.Group controlId="guardrailsAktiv">
                  <Form.ControlLabel>
                    Dynamische Anpassung (Guardrails)
                  </Form.ControlLabel>
                  <Form.Control name="guardrailsAktiv" accepter={Toggle} />
                  <Form.HelpText>
                    Passt die Entnahme basierend auf der Portfolio-Performance
                    an
                  </Form.HelpText>
                </Form.Group>
                {formValue.guardrailsAktiv && (
                  <Form.Group controlId="guardrailsSchwelle">
                    <Form.ControlLabel>
                      Anpassungsschwelle (%)
                    </Form.ControlLabel>
                    <Form.Control
                      name="guardrailsSchwelle"
                      accepter={Slider}
                      min={5}
                      max={20}
                      step={1}
                      handleTitle={
                        <div style={{ marginTop: "-17px" }}>
                          {formValue.guardrailsSchwelle}%
                        </div>
                      }
                      progress
                      graduated
                    />
                    <Form.HelpText>
                      Bei Überschreitung dieser Schwelle wird die Entnahme
                      angepasst
                    </Form.HelpText>
                  </Form.Group>
                )}
              </>
            )}

            {/* Dynamic strategy specific controls */}
            {formValue.strategie === "dynamisch" && (
              <DynamicWithdrawalConfiguration formValue={formValue} />
            )}
          </Form>
        )}
        </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      <Card className="mb-4">
        <Collapsible defaultOpen={false}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                <CardTitle className="text-left">Simulation</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
        <EntnahmeSimulationDisplay
          withdrawalData={withdrawalData}
          formValue={formValue}
          useComparisonMode={useComparisonMode}
          comparisonResults={comparisonResults}
          useSegmentedWithdrawal={useSegmentedWithdrawal}
          withdrawalSegments={withdrawalSegments}
          onCalculationInfoClick={handleCalculationInfoClick}
          grundfreibetragAktiv={grundfreibetragAktiv}
          grundfreibetragBetrag={grundfreibetragBetrag}
        />
        </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {/* Calculation Explanation Modal */}
      {calculationDetails && (
        <CalculationExplanationModal
          open={showCalculationModal}
          onClose={() => setShowCalculationModal(false)}
          title={calculationDetails.title}
          introduction={calculationDetails.introduction}
          steps={calculationDetails.steps}
          finalResult={calculationDetails.finalResult}
        />
      )}

      {/* Vorabpauschale Explanation Modal */}
      {selectedVorabDetails && (
        <VorabpauschaleExplanationModal
          open={showVorabpauschaleModal}
          onClose={() => setShowVorabpauschaleModal(false)}
          selectedVorabDetails={selectedVorabDetails}
        />
      )}
    </>
  );
}

