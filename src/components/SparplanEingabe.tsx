import type { SimulationAnnualType, SimulationResult } from '../utils/simulate';
import { SimulationAnnual } from '../utils/simulate';
import { useState } from "react";

// Simple Close icon component to avoid RSuite icons ESM/CommonJS issues
const CloseIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
import {
    Button,
    ButtonToolbar,
    DatePicker,
    Form,
    InputNumber,
    Panel,
    Table
} from "rsuite";

const { Column, HeaderCell, Cell } = Table;

export type Sparplan = {
    id: number;
    start: Date | string;
    end?: Date | string | null;
    einzahlung: number;
};

export type SparplanElement = {
    start: Date | string;
    type: "sparplan"
    einzahlung: number;
    simulation: SimulationResult;
} | {
    start: Date | string;
    type: "einmalzahlung"
    gewinn: number;
    einzahlung: number;
    simulation: SimulationResult;
};

export const initialSparplan: Sparplan = {
    id: 1,
    start: new Date("2023-01-01"),
    end: new Date("2040-10-01"),
    einzahlung: 24000,
}

export function convertSparplanToElements(val: Sparplan[], startEnd: [number, number], simulationAnnual: SimulationAnnualType): SparplanElement[] {
    const data: SparplanElement[] = val.flatMap((el) => {
        const sparplanElementsToSave: SparplanElement[] = []
        for (let i = new Date().getFullYear(); i <= startEnd[0]; i++) {
            if (new Date(el.start).getFullYear() <= i
                && (!el.end || new Date(el.end).getFullYear() >= i)
            ) {
                if (simulationAnnual === SimulationAnnual.yearly) {
                    sparplanElementsToSave.push({
                        start: new Date(i + "-01-01"),
                        einzahlung: el.einzahlung,
                        type: "sparplan",
                        simulation: {},
                    })
                } else {
                    for (let month = 0; month < 12; month++) {
                        if (new Date(el.start).getFullYear() === i && new Date(el.start).getMonth() > month) {
                            continue;
                        } else if (el.end && new Date(el.end).getFullYear() === i && new Date(el.end).getMonth() < month) {
                            continue;
                        } else {
                            sparplanElementsToSave.push({
                                start: new Date(i + "-" + (month + 1) + "-01"),
                                einzahlung: el.einzahlung / 12,
                                type: "sparplan",
                                simulation: {},
                            })
                        }
                    }
                }
            }

        }
        return sparplanElementsToSave
    })
    return data
}

export function SparplanEingabe({ dispatch, simulationAnnual }: { dispatch: (val: Sparplan[]) => void; simulationAnnual: SimulationAnnualType }) {
    const [sparplans, setSparplans] = useState<Sparplan[]>([
        initialSparplan
    ]);

    const [singleFormValue, setSingleFormValue] = useState<{ date: Date, einzahlung: string }>({
        date: new Date(),
        einzahlung: '',
    });
    const [sparplanFormValues, setSparplanFormValues] = useState<{ start: Date, end: Date | null, einzahlung: string }>({
        start: new Date(),
        end: null,
        einzahlung: '',
    });

    return (
        <>
            <Panel header="Sparpläne erstellen" bordered collapsible>
                <Form fluid
                    formValue={sparplanFormValues}
                    onChange={changedFormValue => setSparplanFormValues({
                        start: changedFormValue.start,
                        end: changedFormValue.end,
                        einzahlung: changedFormValue.einzahlung,

                    })
                    }
                    onSubmit={() => {
                        if (sparplanFormValues.start && sparplanFormValues.einzahlung && sparplanFormValues.einzahlung) {
                            // Convert monthly input to yearly for storage (backend always expects yearly amounts)
                            const yearlyAmount = simulationAnnual === SimulationAnnual.monthly 
                                ? Number(sparplanFormValues.einzahlung) * 12 
                                : Number(sparplanFormValues.einzahlung);
                            
                            const changedSparplans: Sparplan[] = [
                                ...sparplans,
                                {
                                    id: new Date().getTime(),
                                    start: sparplanFormValues.start,
                                    end: sparplanFormValues.end,
                                    einzahlung: yearlyAmount,

                                }
                            ]
                            setSparplans(changedSparplans)
                            dispatch(changedSparplans)
                            setSparplanFormValues({
                                start: new Date(),
                                end: null,
                                einzahlung: '',
                            })
                        }
                    }} >
                    <Form.Group controlId="start">
                        <Form.ControlLabel>Start</Form.ControlLabel>
                        <Form.Control format="yyyy-MM" name="start" accepter={DatePicker} />
                    </Form.Group>
                    <Form.Group controlId="end">
                        <Form.ControlLabel>Ende</Form.ControlLabel>
                        <Form.Control format="yyyy-MM" name="end" accepter={DatePicker} />
                    </Form.Group>
                    <Form.Group controlId="einzahlung">
                        <Form.ControlLabel>
                            {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlungen je Jahr' : 'Einzahlungen je Monat'}
                        </Form.ControlLabel>
                        <Form.Control name="einzahlung" accepter={InputNumber} />
                    </Form.Group>
                    <Form.Group>
                        <ButtonToolbar>
                            <Button
                                appearance="primary"
                                type="submit"
                            >
                                Hinzufügen
                            </Button>
                        </ButtonToolbar>
                    </Form.Group>
                </Form>
            </Panel>
            <Panel header="Einmalzahlungen erstellen" bordered collapsible>
                <Form fluid
                    formValue={singleFormValue}
                    onChange={changedFormValue => setSingleFormValue({
                        date: changedFormValue.date,
                        einzahlung: changedFormValue.einzahlung,

                    })
                    }
                    onSubmit={() => {
                        if (singleFormValue.einzahlung) {
                            const changedSparplans: Sparplan[] = [
                                ...sparplans,
                                {
                                    id: new Date().getTime(),
                                    start: singleFormValue.date,
                                    end: singleFormValue.date,
                                    einzahlung: Number(singleFormValue.einzahlung),

                                }
                            ]
                            setSparplans(changedSparplans)
                            dispatch(changedSparplans)
                            setSingleFormValue({
                                date: new Date(),
                                einzahlung: '',
                            })
                        }
                    }} >
                    <Form.Group controlId="date">
                        <Form.ControlLabel>Datum</Form.ControlLabel>
                        <Form.Control format="yyyy-MM" name="date" accepter={DatePicker} />
                    </Form.Group>
                    <Form.Group controlId="einzahlung">
                        <Form.ControlLabel>Einzahlung</Form.ControlLabel>
                        <Form.Control name="einzahlung" accepter={InputNumber} />
                    </Form.Group>
                    <Form.Group>
                        <ButtonToolbar>
                            <Button
                                appearance="primary"
                                type="submit"
                            >
                                Hinzufügen
                            </Button>
                        </ButtonToolbar>
                    </Form.Group>
                </Form>
            </Panel>
            <Panel header="gespeicherte Sparpläne" bordered bodyFill collapsible expanded>
                <Table
                    autoHeight
                    data={sparplans}
                    bordered
                    rowHeight={60}
                >
                    <Column width={130}>
                        <HeaderCell>Start</HeaderCell>
                        <ChangeDateCell onChange={(id, value) => {
                            if (!value) {
                                return
                            }
                            const changedSparplans = sparplans.map((el) => el.id === id ? { ...el, start: value } : el)
                            setSparplans(changedSparplans)
                            dispatch(changedSparplans)
                        }} dataKey="start" />
                    </Column>
                    <Column width={130} >
                        <HeaderCell>End</HeaderCell>
                        <ChangeDateCell onChange={(id, value) => {
                            const changedSparplans = sparplans.map((el) => el.id === id ? { ...el, end: value } : el)
                            setSparplans(changedSparplans)
                            dispatch(changedSparplans)
                        }} dataKey="end" />
                    </Column>
                    <Column width={140}>
                        <HeaderCell>
                            {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlungen je Jahr' : 'Einzahlungen je Monat'}
                        </HeaderCell>
                        <Cell>
                            {(rowData: Sparplan) => {
                                const displayValue = simulationAnnual === SimulationAnnual.monthly 
                                    ? (rowData.einzahlung / 12).toFixed(2)
                                    : rowData.einzahlung.toFixed(2);
                                return displayValue;
                            }}
                        </Cell>
                    </Column>
                    <Column>
                        <HeaderCell>Actions</HeaderCell>
                        <Cell>
                            {(action) => (
                                <Button
                                    onClick={() => {
                                        const changedSparplans = sparplans.filter((el) => el.id !== action.id)
                                        setSparplans(changedSparplans)
                                        dispatch(changedSparplans)
                                    }}
                                >
                                    <CloseIcon />
                                </Button>
                            )}
                        </Cell>
                    </Column>
                </Table>
            </Panel>
        </>
    );

}

function ChangeDateCell({
    rowData,
    dataKey,
    onChange,
    ...props
}: {
    rowData?: { id: any, [key: string]: Date | null }
    dataKey: string;
    onChange?: (id: any, val: Date | null) => void;
}) {
    const [isFocused, setIsFocused] = useState(false)

    return <Cell {...props} onClick={() => setIsFocused(true)}>
        {isFocused ?
            <DatePicker
                defaultOpen
                format="yyyy-MM"
                defaultValue={rowData?.[dataKey]}
                onChange={(val) => {
                    if (rowData) {
                        rowData[dataKey] = val
                    }
                    onChange && onChange(rowData?.id, val)
                }}
                onClose={() => setIsFocused(false)}
            />
            :
            rowData?.[dataKey]?.toLocaleDateString()}
    </Cell>;
}

