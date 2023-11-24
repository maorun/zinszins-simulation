import type { MetaFunction } from "@vercel/remix";
import { Close } from '@rsuite/icons';
import 'rsuite/dist/rsuite.min.css';
import { useState } from "react";
import {
    Button,
    ButtonToolbar,
    Col,
    DatePicker,
    Form,
    InputGroup,
    InputNumber,
    Panel,
    Radio,
    RadioGroup,
    RadioTile,
    RadioTileGroup,
    Row,
    Slider,
    Stack,
    Table
} from "rsuite";

const { Column, HeaderCell, Cell } = Table;

type Sparplan = {
    id: number;
    start: Date;
    end?: Date | null;
    einzahlung: number;
};

type SparplanElement = {
    start: Date;
    type: "sparplan"
    einzahlung: number;
    simulation: SimulationResult;
} | {
    start: Date;
    type: "einmalzahlung"
    gewinn: number;
    einzahlung: number;
    simulation: SimulationResult;
};

const Berechnungen = {
 simulate: (
    startYear: number,
    endYear: number,
    elements: SparplanElement[],
    wachstumsrate: number,
    steuerlast: number,
    simulationAnnual: SimulationAnnualType
): number[] => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
        for (const element of elements) {
            element.simulation = {}
        }
    }
    for (let year = startYear; year <= endYear; year++) {
        years.push(year);
        let freibetragInYear = freibetrag[2023];
        if (
            simulationAnnual === SimulationAnnual.monthly) {

            const wachstumsrateMonth = Math.pow(1+wachstumsrate, 1/12) - 1

            for (const element of elements) {
                if (element.start.getFullYear() <= year) {
                    if (element.start.getFullYear() === year) {

                        //wertzuwachs unterjahr
                        for (let month = 1; month <= 12; month++) {
                            if (element.start.getMonth() + 1  <= month) {
                                if (!element.simulation[year]?.startkapital) {
                                    element.simulation[year] = {
                                        startkapital: element.einzahlung,
                                        endkapital: element.einzahlung * (1 + wachstumsrateMonth),
                                        zinsen:0,
                                        bezahlteSteuer: 0,
                                        genutzterFreibetrag: 0,
                                    }
                                } else {
                                    element.simulation[year] = {
                                        startkapital: (element.simulation[year]?.startkapital || 0),
                                        endkapital: ((element.simulation[year]?.endkapital || 0)) * (1 + wachstumsrateMonth),
                                        zinsen:0,
                                        bezahlteSteuer: 0,
                                        genutzterFreibetrag: 0,
                                    };

                                }
                            }
                        }
                    } else {
                        let kapital =
                            element.simulation[year - 1]?.endkapital ||
                                element.einzahlung + (element.type === "einmalzahlung" ? element.gewinn : 0);

                        const endKapital = Berechnungen.zinszinsVorabpauschale(
                            kapital,
                            basiszinsen[2023],
                            freibetragInYear,
                            steuerlast
                        );

                        element.simulation[year] = {
                            startkapital: kapital,
                            endkapital: kapital * (1 + wachstumsrate) - endKapital.steuer,
                            zinsen: kapital * ( 1 + wachstumsrate),
                            bezahlteSteuer: endKapital.steuer,
                            genutzterFreibetrag: 0,

                        };
                        element.simulation[year]['genutzterFreibetrag'] = freibetragInYear - endKapital.verbleibenderFreibetrag
                    }
                }
            }
            for (const element of elements) {
                if (element.start.getFullYear() <= year) {
                    const month = element.start.getMonth() + 1
                    const kapital = element.simulation[year]?.startkapital || element.einzahlung;

                    const vorabPauschaleZinzen = Berechnungen.zinszinsVorabpauschale(
                        kapital,
                        basiszinsen[2023],
                        freibetragInYear,
                        steuerlast,
                        0.7,
                        0.3,
                        month
                    );
                    element.simulation[year]['bezahlteSteuer'] = vorabPauschaleZinzen.steuer
                    element.simulation[year]['endkapital'] -= vorabPauschaleZinzen.steuer
                    element.simulation[year]['zinsen'] = element.simulation[year]['endkapital'] - element.simulation[year]['startkapital']
                    element.simulation[year]['genutzterFreibetrag'] = freibetragInYear - vorabPauschaleZinzen.verbleibenderFreibetrag
                    freibetragInYear = vorabPauschaleZinzen.verbleibenderFreibetrag;
                }
            }
        } else {
            for (const element of elements) {
                if (element.start.getFullYear() <= year) {
                    let kapital =
                        element.simulation[year - 1]?.endkapital ||
                            element.einzahlung + (element.type === "einmalzahlung" ? element.gewinn : 0);

                    const endKapital = Berechnungen.zinszinsVorabpauschale(
                        kapital,
                        basiszinsen[2023],
                        freibetragInYear,
                        steuerlast
                    );

                    element.simulation[year] = {
                        startkapital: kapital,
                        endkapital: kapital * (1 + wachstumsrate) - endKapital.steuer,
                        zinsen: kapital * ( 1 + wachstumsrate),
                        bezahlteSteuer: endKapital.steuer,
                        genutzterFreibetrag: 0,

                    };
                    element.simulation[year]['genutzterFreibetrag'] = freibetragInYear - endKapital.verbleibenderFreibetrag
                    freibetragInYear = endKapital.verbleibenderFreibetrag;
                }
            }
        }
    }


    return years;
},

    convertSparplanToElements: (val: Sparplan[], startEnd: [number, number], simulationAnnual: SimulationAnnualType): SparplanElement[] => {
        const data: SparplanElement[] = val.flatMap((el) => {
            const sparplanElementsToSave: SparplanElement[] = []
            for (let i = new Date().getFullYear(); i <= startEnd[0]; i++) {
                if (el.start.getFullYear() <= i 
                    && (!el.end || el.end.getFullYear() >= i)
                ) {
                    if (simulationAnnual === SimulationAnnual.yearly) {
                        sparplanElementsToSave.push({
                            start: new Date(i + "-01-01"),
                            einzahlung: el.einzahlung,
                            type: "sparplan",
                            simulation: {},
                        })
                    } else {
                        for(let month = 0; month < 12; month++) {
                            if (el.start.getFullYear() === i && el.start.getMonth() > month) {
                                continue;
                            } else if (el.end && el.end.getFullYear() === i && el.end.getMonth() < month) {
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
    },
    getSparplanSummary: (element: SimulationResult): Summary => {
        const first: SimulationResultElement | undefined = Object.values(element).shift()
        const last: SimulationResultElement  | undefined= Object.values(element).pop()

        return {
            startkapital: first?.startkapital || 0,
            zinsen: Number(last?.endkapital) - Number(first?.startkapital),
            bezahlteSteuer: Object.values(element).reduce(
                (previousValue, currentValue) =>
                    previousValue + currentValue.bezahlteSteuer,
                0
            ),
            endkapital: last?.endkapital || 0,
        };
    },
    fullSummary: (elemente: SparplanElement[]): Summary => {
        return elemente
            .map((element) => element.simulation)
            .map(Berechnungen.getSparplanSummary)
            .reduce(
                (previousValue, currentValue) => ({
                    startkapital: Number(previousValue.startkapital) + Number(currentValue.startkapital),
                    zinsen: previousValue.zinsen + currentValue.zinsen,
                    bezahlteSteuer: previousValue.bezahlteSteuer + currentValue.bezahlteSteuer,
                    endkapital:
                    Number(previousValue.endkapital) + Number(currentValue.endkapital),
                }),
                {
                    startkapital: 0,
                    zinsen: 0,
                    bezahlteSteuer: 0,
                    endkapital: 0,
                }
            );

    },
    vorabpauschale: (
        startwert = 10000,
        basiszins = 0.0255,
        steuerlast = 0.26375,
        vorabpauschale_prozentsatz = 0.7,
        teilFreistellungsquote = 0.3,
        anteilImJahr = 12,
    ) => {
        // Berechnung der Vorabpauschale für das aktuelle Jahr
        let basisertrag = startwert * basiszins * vorabpauschale_prozentsatz;

        basisertrag = anteilImJahr/12 * basisertrag

        // hier muss noch der vorjahresgewinn berücksichtigen werden
        // vorabpauschale = vorjahresgewinn > vorabpauschale ? vorabpauschale : vorjahresgewinn;
        const vorabpauschale = basisertrag

        return vorabpauschale * steuerlast * (1 - teilFreistellungsquote);
    },

    zinszinsVorabpauschale: (
        startwert = 10000,
        basiszins = 0.0255,
        freibetrag = 1000,
        steuerlast = 0.26375,
        vorabpauschale_prozentsatz = 0.7,
        freistellung = 0.3,
        anteilImJahr = 12,
    ) => {
        let steuer = Berechnungen.vorabpauschale(
            startwert,
            basiszins,
            steuerlast,
            vorabpauschale_prozentsatz,
            freistellung,
            anteilImJahr,
        )

        const verbleibenderFreibetrag = freibetrag - steuer;
        // Abzug der Steuer
        if (steuer > freibetrag) {
            steuer -= freibetrag;
        }
        return {
            steuer: verbleibenderFreibetrag <= 0 ? steuer : 0,
            verbleibenderFreibetrag:
            verbleibenderFreibetrag > 0 ? verbleibenderFreibetrag : 0,
        };
    },
};

const basiszinsen: {
    [year: number]: number;
} = {
    2023: 0.0255,
};

const freibetrag: {
    [year: number]: number;
} = {
    2023: 2000,
};

type SimulationResultElement = {
    startkapital: number;
    zinsen: number;
    endkapital: number;
    bezahlteSteuer: number;
    genutzterFreibetrag: number;
}

type SimulationResult = {
    [year: number]: SimulationResultElement;
};

function Zeitspanne({
    startEnd,
    dispatch,
}: {
    startEnd: [number, number];
    dispatch: (val: [number, number]) => void;
}) {
    const min = 2023;
    const max = 2100;
    const [startOfIndependence, endOfLife] = startEnd;
    return (
        <label>
            Zeitspanne
            <Row>
                <Col md={10}>
                    <Slider
                        min={min}
                        max={max}
                        progress
                        style={{ marginTop: 16 }}
                        value={startOfIndependence}
                        onChange={(value) => {
                            dispatch([value, endOfLife]);
                        }}
                    />
                </Col>
                <Col md={8}>
                    <InputGroup>
                        <InputNumber
                            min={min}
                            max={max}
                            value={startEnd[0]}
                            onChange={(nextValue) => {
                                nextValue = Number(nextValue);
                                const [_start, end] = startEnd;
                                if (nextValue > end || nextValue < min || nextValue > max) {
                                    return;
                                }
                                dispatch([nextValue, end]);
                            }}
                        />
                    </InputGroup>
                </Col>
            </Row>
        </label>
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
    <div>
        <label>{title}</label>
        <div
            style={{
                fontSize: 18,
                color: "#2eabdf",
            }}
        >
            {thousands(summary)}
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
}) => <Cell {...props}>{thousands(rowData[dataKey])}</Cell>;

function ChangeDateCell ({
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


type Summary = {
    startkapital: number;
    zinsen: number;
    bezahlteSteuer: number;
    endkapital: number;
};

const initialSparplan: Sparplan = {
    id: 1,
    start: new Date("2023-01-01"),
    end: new Date("2040-10-01"),
    einzahlung: 24000,
}

const SimulationAnnual: {
    [key in SimulationAnnualType]: SimulationAnnualType
}= {
    yearly: 'yearly',
    monthly: 'monthly',
} as const

type SimulationAnnualType = 'yearly' | 'monthly'

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

function SparplanEingabe({ dispatch }: { dispatch: (val: Sparplan[]) => void }) {
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
        <Stack spacing={10} alignItems="flex-start">
            <Panel
                header="Sparpläne" bordered>
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
                            const changedSparplans: Sparplan[] = [
                                ...sparplans,
                                {
                                    id: new Date().getTime(),
                                    start: sparplanFormValues.start,
                                    end: sparplanFormValues.end,
                                    einzahlung: Number(sparplanFormValues.einzahlung),

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
                        <Form.ControlLabel>Einzahlungen je Jahr</Form.ControlLabel>
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
            <Panel header="Einmalzahlungen" bordered>
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
            <Stack.Item grow={1}>
                <Panel header="gespeichert" bordered bodyFill>
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
                                console.log(changedSparplans)
                                setSparplans(changedSparplans)
                                dispatch(changedSparplans)
                            }} dataKey="end" />
                        </Column>
                        <Column width={140}>
                            <HeaderCell>Einzahlungen je Jahr</HeaderCell>
                            <Cell dataKey="einzahlung" />
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
                                        <Close />
                                    </Button>
                                )}
                            </Cell>
                        </Column>
                    </Table>
                </Panel>
            </Stack.Item>
        </Stack>
    );
}

function EntnahmeSimulationsAusgabe({
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
                    <Form.Group controlId="startRente">
                        <Form.ControlLabel>End of Life</Form.ControlLabel>
                        <Form.Control name="endOfLife" accepter={InputNumber} 
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
                asdf
            </Panel>
        </Panel>
    )
}

function SparplanSimulationsAusgabe({
    elemente,
}: {
    elemente: SparplanElement[];
}) {
    const summary: Summary = Berechnungen.fullSummary(elemente)
    return (
        <Panel header="Sparplan-Verlauf" bordered>
            <Table
                data={elemente.sort((a,b) => b.start.getTime() - a.start.getTime()
                ).map((el) => ({
                        ...el,
                        zeitpunkt: el.start.toLocaleDateString(),
                        zinsen: Berechnungen.getSparplanSummary(el.simulation).zinsen.toFixed(2),
                        bezahlteSteuer: Berechnungen.getSparplanSummary(
                            el.simulation
                        ).bezahlteSteuer.toFixed(2),
                        endkapital: Berechnungen.getSparplanSummary(el.simulation).endkapital?.toFixed(2),
                    }))}
                bordered
                headerHeight={60}
            >
                <Column width={280}>
                    <HeaderCell>Zeitpunkt</HeaderCell>
                    <Cell dataKey="zeitpunkt" />
                </Column>

                <Column flexGrow={1}>
                    <HeaderCell>
                        <HeaderSummary
                            title="Einzahlung"
                            summary={summary.startkapital?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <NumberCell dataKey="einzahlung" />
                </Column>

                <Column width={120}>
                    <HeaderCell>
                        <HeaderSummary
                            title="bezahlte Steuer"
                            summary={summary.bezahlteSteuer?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <NumberCell dataKey="bezahlteSteuer" />
                </Column>
                <Column width={120}>
                    <HeaderCell>
                        <HeaderSummary
                            title="Zinsen"
                            summary={summary.zinsen?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <NumberCell dataKey="zinsen" />
                </Column>
                <Column width={120}>
                    <HeaderCell>
                        <HeaderSummary
                            title="Endkapital"
                            summary={summary.endkapital?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <NumberCell dataKey="endkapital" />
                </Column>
            </Table>
        </Panel>
    );
}


export default function Index() {
    const [rendite, setRendite] = useState(5);
    const steuerlast = 0.26375; // https://de.wikipedia.org/wiki/Kapitalertragsteuer_(Deutschland)#Bemessung_der_Kapitalertragsteuer

    // const Grundfreibetrag = 9744; // erst bei Auszahlung
    const [startEnd, setStartEnd] = useState<[number, number]>([2040, 2080]);

    const [sparplan, setSparplan] = useState<Sparplan[]>([initialSparplan]);

    const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(SimulationAnnual.yearly)
    const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
        Berechnungen.convertSparplanToElements([initialSparplan], startEnd, simulationAnnual)
    );

    const data = Berechnungen.simulate(
        new Date().getFullYear(),
        startEnd[0],
        sparplanElemente,
        rendite / 100,
        steuerlast,
        simulationAnnual
    )

    return (
        <div >

            <Button
                onClick={() => setSparplanElemente(Berechnungen.convertSparplanToElements(sparplan, startEnd, simulationAnnual))}
                >
                Refresh</Button>

            <Panel header="Eingabe" bordered>
                <Panel header="Variablen" bordered>
                    <Zeitspanne startEnd={startEnd} dispatch={(val) => {
                        setStartEnd(val)
                        setSparplanElemente(Berechnungen.convertSparplanToElements(sparplan, val, simulationAnnual))
                    }} />
                    <label htmlFor="rendite">Rendite</label>
                    <Slider
                        name="rendite"
                        renderTooltip={(value) => value + "%"}
                        handleTitle={(<div style={{marginTop: 15}}>{rendite} %</div>)}
                        progress
                        defaultValue={rendite}
                        min={0}
                        max={10}
                        step={0.5}
                        graduated
                        onChange={setRendite}
                    />
                    <RadioGroup name="simulationAnnual" inline value={simulationAnnual} onChange={(value) => {
                        const val = value.toString() === SimulationAnnual.yearly ? 'yearly' : 'monthly'
                        setSimulationAnnual(val)
                        setSparplanElemente(Berechnungen.convertSparplanToElements(sparplan, startEnd, val))
                    }}>
                        <Radio value={SimulationAnnual.yearly}>jährlich</Radio>
                        <Radio value={SimulationAnnual.monthly}>monatlich</Radio>
                    </RadioGroup>
                </Panel>
                <SparplanEingabe dispatch={(val) => {
                    setSparplan(val)
                    setSparplanElemente(Berechnungen.convertSparplanToElements(val, startEnd, simulationAnnual))
                }} />
            </Panel>
            <SparplanSimulationsAusgabe
                elemente={sparplanElemente}
            />
            <EntnahmeSimulationsAusgabe
                dispatchEnd={setStartEnd}
                startEnd={startEnd}
                elemente={sparplanElemente}
            />

            <Panel header="Simulation" bordered collapsible>
                <div>
                    {data
                        .sort((a, b) => b - a)
                        .map((year, index) => {
                            return (
                                <div key={index}>
                                    Year: {year}
                                    {sparplanElemente
                                        .map((value) => value.simulation[Number(year)])
                                        .filter(Boolean)
                                        .flat()
                                        .map((value, index) => {
                                            return (
                                                <ul key={index}>
                                                    <li>
                                                        Startkapital:
                                                        {Number(value.startkapital).toFixed(2)}
                                                    </li>
                                                    <li>Zinsen: {Number(value.zinsen).toFixed(2)}</li>
                                                    <li>
                                                        Endkapital: {Number(value.endkapital).toFixed(2)}
                                                    </li>
                                                    <li>
                                                        Bezahlte Steuer:
                                                        {Number(value.bezahlteSteuer).toFixed(2)}
                                                    </li>
                                                    <li>
                                                        Genutzter Freibetrag:
                                                        {Number(value.genutzterFreibetrag).toFixed(2)}
                                                    </li>
                                                </ul>
                                            );
                                        })}
                                </div>
                            );
                        })}
                </div>
            </Panel>

        </div>
    );
}
