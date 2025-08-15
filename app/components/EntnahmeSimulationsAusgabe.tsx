import { useState, useMemo } from "react";
import {
    Form,
    InputNumber,
    Panel,
    RadioTile,
    RadioTileGroup,
    Slider,
    Table
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import type { SparplanElement } from "./SparplanEingabe";
import { calculateWithdrawal, getTotalCapitalAtYear } from "helpers/withdrawal";
import type { WithdrawalStrategy } from "helpers/withdrawal";

const { Column, HeaderCell, Cell } = Table;

export function EntnahmeSimulationsAusgabe({
    startEnd,
    elemente,
    dispatchEnd,
}: {
        startEnd: [number, number];
        elemente: SparplanElement[];
        dispatchEnd: (val: [number, number]) => void;
    }) {
    const [startOfIndependence, endOfLife] = startEnd;

    const [formValue, setFormValue] = useState({
        endOfLife,
        strategie: "4prozent",
        rendite: 5,
    });

    // Calculate withdrawal projections
    const withdrawalData = useMemo(() => {
        if (!elemente || elemente.length === 0) {
            return null;
        }

        // Get total accumulated capital at the start of withdrawal phase
        const startingCapital = getTotalCapitalAtYear(elemente, startOfIndependence);
        
        if (startingCapital <= 0) {
            return null;
        }

        // Calculate withdrawal projections
        const withdrawalResult = calculateWithdrawal(
            startingCapital,
            startOfIndependence + 1, // Start withdrawals the year after accumulation ends
            formValue.endOfLife,
            formValue.strategie as WithdrawalStrategy,
            formValue.rendite / 100 // Convert percentage to decimal
        );

        // Convert to array for table display, sorted by year descending
        const withdrawalArray = Object.entries(withdrawalResult)
            .map(([year, data]) => ({
                year: parseInt(year),
                ...data
            }))
            .sort((a, b) => b.year - a.year);

        return {
            startingCapital,
            withdrawalArray,
            withdrawalResult
        };
    }, [elemente, startOfIndependence, formValue.endOfLife, formValue.strategie, formValue.rendite]);

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Panel header="Entnahme" bordered collapsible>
            <Panel header="Variablen" bordered>
                <Form fluid formValue={formValue}
                    onChange={changedFormValue => {
                        dispatchEnd([startOfIndependence, changedFormValue.endOfLife])
                        setFormValue({
                            endOfLife: changedFormValue.endOfLife,
                            strategie: changedFormValue.strategie,
                            rendite: changedFormValue.rendite,
                        })
                    }}
                >
                    <Form.Group controlId="rendite">
                        <Form.ControlLabel>erwartete Rendite</Form.ControlLabel>
                        <Form.Control name="rendite" accepter={Slider} 
                            min={0}
                            max={10}
                            step={0.5}
                            handleTitle={(<div style={{marginTop: 15}}>{formValue.rendite} %</div>)}
                            progress
                            graduated
                        />
                    </Form.Group>
                    <Form.Group controlId="endOfLife">
                        <Form.ControlLabel>End of Life</Form.ControlLabel>
                        <Form.Control name="endOfLife" accepter={InputNumber} 
                        />
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
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Panel>
            <Panel header="Simulation" bordered>
                {withdrawalData ? (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h4>Entnahme-Simulation</h4>
                            <p><strong>Startkapital bei Entnahme:</strong> {formatCurrency(withdrawalData.startingCapital)}</p>
                                                        <p><strong>Jährliche Entnahme ({formValue.strategie === "4prozent" ? "4 Prozent" : "3 Prozent"} Regel):</strong> {formatCurrency(withdrawalData.startingCapital * (formValue.strategie === "4prozent" ? 0.04 : 0.03))}</p>
                            <p><strong>Erwartete Rendite:</strong> {formValue.rendite} Prozent p.a.</p>
                        </div>
                        
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
                                    {rowData => formatCurrency(rowData.startkapital)}
                                </Cell>
                            </Column>
                            <Column width={120}>
                                <HeaderCell>Entnahme</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.entnahme)}
                                </Cell>
                            </Column>
                            <Column width={100}>
                                <HeaderCell>Zinsen</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.zinsen)}
                                </Cell>
                            </Column>
                            <Column width={120}>
                                <HeaderCell>bezahlte Steuer</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.bezahlteSteuer)}
                                </Cell>
                            </Column>
                            <Column width={120}>
                                <HeaderCell>Endkapital</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.endkapital)}
                                </Cell>
                            </Column>
                        </Table>
                    </div>
                ) : (
                    <div>
                        <p>Keine Daten verfügbar. Bitte stelle sicher, dass Sparpläne definiert sind und eine Simulation durchgeführt wurde.</p>
                    </div>
                )}
            </Panel>
        </Panel>
    )
}


