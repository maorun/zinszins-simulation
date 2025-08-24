import { useState, useMemo, useEffect } from "react";
import {
    Form,
    InputNumber,
    Panel,
    Radio,
    RadioGroup,
    RadioTile,
    RadioTileGroup,
    Slider,
    Table,
    Toggle
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import type { SparplanElement } from "../utils/sparplan-utils";
import { calculateWithdrawal, calculateSegmentedWithdrawal, getTotalCapitalAtYear, calculateWithdrawalDuration } from "../utils/withdrawal";
import type { WithdrawalStrategy, WithdrawalResult } from "../utils/withdrawal";
import type { ReturnConfiguration } from "../../helpers/random-returns";
import type { WithdrawalSegment, SegmentedWithdrawalConfig } from "../utils/segmented-withdrawal";
import { createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import { WithdrawalSegmentForm } from "./WithdrawalSegmentForm";

const { Column, HeaderCell, Cell } = Table;

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable';

export function EntnahmeSimulationsAusgabe({
    startEnd,
    elemente,
    dispatchEnd,
    onWithdrawalResultsChange,
}: {
        startEnd: [number, number];
        elemente: SparplanElement[];
        dispatchEnd: (val: [number, number]) => void;
        onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void;
    }) {
    const [startOfIndependence, endOfLife] = startEnd;

    const [formValue, setFormValue] = useState({
        endOfLife,
        strategie: "4prozent" as WithdrawalStrategy,
        rendite: 5,
        inflationAktiv: false,
        inflationsrate: 2,
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 10,
        variabelProzent: 4,
        dynamicUpperThreshold: 8,
        dynamicUpperAdjustment: 10,
        dynamicLowerThreshold: -5,
        dynamicLowerAdjustment: -10,
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 10908,
        einkommensteuersatz: 25,
    });

    const [withdrawalReturnMode, setWithdrawalReturnMode] = useState<WithdrawalReturnMode>('fixed');
    const [withdrawalVariableReturns, setWithdrawalVariableReturns] = useState<Record<number, number>>({});
    const [withdrawalAverageReturn, setWithdrawalAverageReturn] = useState(5);
    const [withdrawalStandardDeviation, setWithdrawalStandardDeviation] = useState(12);
    const [withdrawalRandomSeed, setWithdrawalRandomSeed] = useState<number | undefined>(undefined);
    const [useSegmentedWithdrawal, setUseSegmentedWithdrawal] = useState(false);
    const [withdrawalSegments, setWithdrawalSegments] = useState<WithdrawalSegment[]>(() => [
        createDefaultWithdrawalSegment("main", "Hauptphase", startOfIndependence + 1, endOfLife)
    ]);

    const withdrawalData = useMemo(() => {
        if (!elemente || elemente.length === 0) return null;
        const startingCapital = getTotalCapitalAtYear(elemente, startOfIndependence);
        if (startingCapital <= 0) return null;

        let withdrawalResult;
        if (useSegmentedWithdrawal) {
            const segmentedConfig: SegmentedWithdrawalConfig = {
                segments: withdrawalSegments,
                taxRate: 0.26375,
                freibetragPerYear: undefined
            };
            withdrawalResult = calculateSegmentedWithdrawal(startingCapital, segmentedConfig);
        } else {
            let withdrawalReturnConfig: ReturnConfiguration;
            if (withdrawalReturnMode === 'random') {
                withdrawalReturnConfig = {
                    mode: 'random',
                    randomConfig: {
                        averageReturn: withdrawalAverageReturn / 100,
                        standardDeviation: withdrawalStandardDeviation / 100,
                        seed: withdrawalRandomSeed
                    }
                };
            } else if (withdrawalReturnMode === 'variable') {
                withdrawalReturnConfig = {
                    mode: 'variable',
                    variableConfig: {
                        yearlyReturns: Object.fromEntries(
                            Object.entries(withdrawalVariableReturns).map(([year, rate]) => [parseInt(year), rate / 100])
                        )
                    }
                };
            } else {
                withdrawalReturnConfig = { mode: 'fixed', fixedRate: formValue.rendite / 100 };
            }

            withdrawalResult = calculateWithdrawal(
                startingCapital,
                startOfIndependence + 1,
                formValue.endOfLife,
                formValue.strategie,
                withdrawalReturnConfig,
                0.26375,
                undefined,
                formValue.strategie === "monatlich_fest" ? {
                    monthlyAmount: formValue.monatlicheBetrag,
                    enableGuardrails: formValue.guardrailsAktiv,
                    guardrailsThreshold: formValue.guardrailsSchwelle / 100
                } : undefined,
                (formValue.strategie === "variabel_prozent" || formValue.strategie === "dynamisch_prozent") ? formValue.variabelProzent / 100 : undefined,
                formValue.grundfreibetragAktiv,
                formValue.grundfreibetragAktiv ? (() => {
                    const grundfreibetragPerYear: {[year: number]: number} = {};
                    for (let year = startOfIndependence + 1; year <= formValue.endOfLife; year++) {
                        grundfreibetragPerYear[year] = formValue.grundfreibetragBetrag;
                    }
                    return grundfreibetragPerYear;
                })() : undefined,
                formValue.grundfreibetragAktiv ? formValue.einkommensteuersatz / 100 : undefined,
                undefined,
                formValue.inflationAktiv ? { inflationRate: formValue.inflationsrate / 100 } : undefined,
                formValue.strategie === "dynamisch_prozent" ? {
                    upperThreshold: formValue.dynamicUpperThreshold / 100,
                    upperAdjustment: formValue.dynamicUpperAdjustment / 100,
                    lowerThreshold: formValue.dynamicLowerThreshold / 100,
                    lowerAdjustment: formValue.dynamicLowerAdjustment / 100,
                } : undefined
            );
        }

        const withdrawalArray = Object.entries(withdrawalResult).map(([year, data]) => ({ year: parseInt(year), ...data })).sort((a, b) => b.year - a.year);
        const duration = calculateWithdrawalDuration(withdrawalResult, startOfIndependence + 1);
        return { startingCapital, withdrawalArray, withdrawalResult, duration };
    }, [elemente, startOfIndependence, formValue, withdrawalReturnMode, withdrawalVariableReturns, withdrawalAverageReturn, withdrawalStandardDeviation, withdrawalRandomSeed, useSegmentedWithdrawal, withdrawalSegments]);

    useEffect(() => {
        if (onWithdrawalResultsChange && withdrawalData) {
            onWithdrawalResultsChange(withdrawalData.withdrawalResult);
        }
    }, [withdrawalData, onWithdrawalResultsChange]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <>
            <Panel header="Variablen" bordered>
                <Form.Group controlId="useSegmentedWithdrawal">
                    <Form.ControlLabel>Entnahme-Modus</Form.ControlLabel>
                    <RadioGroup inline value={useSegmentedWithdrawal ? "segmented" : "single"} onChange={(value) => setUseSegmentedWithdrawal(value === "segmented")}>
                        <Radio value="single">Einheitliche Strategie</Radio>
                        <Radio value="segmented">Geteilte Phasen</Radio>
                    </RadioGroup>
                </Form.Group>

                {useSegmentedWithdrawal ? (
                    <WithdrawalSegmentForm segments={withdrawalSegments} onSegmentsChange={setWithdrawalSegments} withdrawalStartYear={startOfIndependence + 1} withdrawalEndYear={formValue.endOfLife} />
                ) : (
                    <Form fluid formValue={formValue} onChange={setFormValue}>
                        <Form.Group controlId="withdrawalReturnMode">
                            <Form.ControlLabel>Entnahme-Rendite Modus</Form.ControlLabel>
                            <RadioGroup inline value={withdrawalReturnMode} onChange={(value) => setWithdrawalReturnMode(value as WithdrawalReturnMode)}>
                                <Radio value="fixed">Feste Rendite</Radio>
                                <Radio value="random">Zufällige Rendite</Radio>
                                <Radio value="variable">Variable Rendite</Radio>
                            </RadioGroup>
                        </Form.Group>
                        {withdrawalReturnMode === 'fixed' && (
                            <Form.Group controlId="rendite">
                                <Form.ControlLabel>Erwartete Rendite (%)</Form.ControlLabel>
                                <Form.Control name="rendite" accepter={Slider} min={0} max={10} step={0.5} progress graduated />
                            </Form.Group>
                        )}
                        <Form.Group controlId="endOfLife">
                            <Form.ControlLabel>End of Life</Form.ControlLabel>
                            <Form.Control name="endOfLife" accepter={InputNumber} />
                        </Form.Group>
                        <Form.Group controlId="strategie">
                            <Form.ControlLabel>Strategie</Form.ControlLabel>
                            <Form.Control name="strategie" accepter={RadioTileGroup}>
                                <RadioTile value="4prozent" label="4% Regel" />
                                <RadioTile value="3prozent" label="3% Regel" />
                                <RadioTile value="variabel_prozent" label="Variable Prozent" />
                                <RadioTile value="monatlich_fest" label="Monatlich fest" />
                                <RadioTile value="dynamisch_prozent" label="Dynamische Entnahme" />
                            </Form.Control>
                        </Form.Group>
                        {(formValue.strategie === "variabel_prozent" || formValue.strategie === "dynamisch_prozent") && (
                            <Form.Group controlId="variabelProzent">
                                <Form.ControlLabel>Basis-Entnahmerate (%)</Form.ControlLabel>
                                <Form.Control name="variabelProzent" accepter={Slider} min={2} max={7} step={0.5} progress graduated />
                            </Form.Group>
                        )}
                        {formValue.strategie === "dynamisch_prozent" && (
                            <Panel bordered style={{background: '#f8f9fa'}}>
                                <p style={{marginBottom: '10px', fontWeight: 500}}>Regeln für dynamische Anpassung:</p>
                                <Form.Group controlId="dynamicUpperThreshold"><Form.ControlLabel>Obere Schwelle Rendite (%)</Form.ControlLabel><Form.Control name="dynamicUpperThreshold" accepter={Slider} min={5} max={20} step={1} /></Form.Group>
                                <Form.Group controlId="dynamicUpperAdjustment"><Form.ControlLabel>...passe Entnahme an um (%)</Form.ControlLabel><Form.Control name="dynamicUpperAdjustment" accepter={Slider} min={0} max={25} step={1} /></Form.Group>
                                <hr style={{margin: '20px 0'}} />
                                <Form.Group controlId="dynamicLowerThreshold"><Form.ControlLabel>Untere Schwelle Rendite (%)</Form.ControlLabel><Form.Control name="dynamicLowerThreshold" accepter={Slider} min={-15} max={0} step={1} /></Form.Group>
                                <Form.Group controlId="dynamicLowerAdjustment"><Form.ControlLabel>...passe Entnahme an um (%)</Form.ControlLabel><Form.Control name="dynamicLowerAdjustment" accepter={Slider} min={-25} max={0} step={1} /></Form.Group>
                            </Panel>
                        )}
                    </Form>
                )}
            </Panel>
            <Panel header="Simulation" bordered>
                {withdrawalData ? (
                    <div>
                        <p>Startkapital: {formatCurrency(withdrawalData.startingCapital)}</p>
                        <Table autoHeight data={withdrawalData.withdrawalArray} bordered>
                            <Column width={70} align="center"><HeaderCell>Jahr</HeaderCell><Cell dataKey="year" /></Column>
                            <Column width={130}><HeaderCell>Startkapital</HeaderCell><Cell>{rowData => formatCurrency(rowData.startkapital)}</Cell></Column>
                            <Column width={130}><HeaderCell>Entnahme</HeaderCell><Cell>{rowData => formatCurrency(rowData.entnahme)}</Cell></Column>
                            <Column width={130}><HeaderCell>Zinsen</HeaderCell><Cell>{rowData => formatCurrency(rowData.zinsen)}</Cell></Column>
                            <Column width={130}><HeaderCell>Bezahlte Steuer</HeaderCell><Cell>{rowData => formatCurrency(rowData.bezahlteSteuer)}</Cell></Column>
                            <Column width={130}><HeaderCell>Endkapital</HeaderCell><Cell>{rowData => formatCurrency(rowData.endkapital)}</Cell></Column>
                        </Table>
                    </div>
                ) : <p>Keine Daten verfügbar.</p>}
            </Panel>
        </>
    )
}
