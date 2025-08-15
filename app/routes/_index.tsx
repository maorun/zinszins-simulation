import { useFetcher } from "@remix-run/react";
import type { MetaFunction } from "@vercel/remix";
import { SimulationAnnual, type SimulationAnnualType } from "helpers/simulate";
import type { ReturnMode } from "helpers/random-returns";
import { useCallback, useEffect, useState } from "react";
import {
    Button,
    Panel,
    Radio,
    RadioGroup,
    Slider,
    InputNumber,
    Toggle,
    Form
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import { EntnahmeSimulationsAusgabe } from "~/components/EntnahmeSimulationsAusgabe";
import { MonteCarloResults } from "~/components/MonteCarloResults";
import type { Sparplan, SparplanElement } from "~/components/SparplanEingabe";
import { SparplanEingabe, convertSparplanToElements, initialSparplan } from "~/components/SparplanEingabe";
import { SparplanEnd, SparplanSimulationsAusgabe } from "~/components/SparplanSimulationsAusgabe";
import { Zeitspanne } from "~/components/Zeitspanne";
import type { action } from "./simulate";

export const unique = function <T extends undefined | number | string>(data: undefined | null | T[]): T[] {
    if (!data || !data.length) {
        return []
    }
    return data.reduce((acc, curr) => {
        if (!acc.includes(curr)) {
            acc.push(curr)
        }
        return acc
    }, [] as T[])
}

export default function Index() {
    const [rendite, setRendite] = useState(5);
    
    // Tax configuration state
    const [steuerlast, setSteuerlast] = useState(26.375); // Capital gains tax rate as percentage
    const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(30); // Partial exemption rate as percentage

    // Return configuration state
    const [returnMode, setReturnMode] = useState<ReturnMode>('fixed');
    const [averageReturn, setAverageReturn] = useState(7); // Percentage for random returns
    const [standardDeviation, setStandardDeviation] = useState(15); // Percentage
    const [randomSeed, setRandomSeed] = useState<number | undefined>(undefined);

    // const Grundfreibetrag = 9744; // erst bei Auszahlung
    const [startEnd, setStartEnd] = useState<[number, number]>([2040, 2080]);

    const [sparplan, setSparplan] = useState<Sparplan[]>([initialSparplan]);

    const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(SimulationAnnual.yearly)
    const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
        convertSparplanToElements([initialSparplan], startEnd, simulationAnnual)
    );

    const d = useFetcher<typeof action>()

    const yearToday = new Date().getFullYear()

    const load = useCallback((overwrite: { rendite?: number } = {}) => {
        const formData: any = {
            year: yearToday,
            end: startEnd[0],
            sparplanElements: JSON.stringify(sparplanElemente),
            steuerlast: steuerlast / 100, // Convert percentage to decimal
            teilfreistellungsquote: teilfreistellungsquote / 100, // Convert percentage to decimal
            simulationAnnual,
            ...overwrite
        };

        // Add return configuration based on mode
        if (returnMode === 'fixed') {
            formData.returnMode = 'fixed';
            formData.fixedRate = (overwrite.rendite !== undefined ? overwrite.rendite : rendite) / 100;
        } else {
            formData.returnMode = 'random';
            formData.averageReturn = averageReturn / 100;
            formData.standardDeviation = standardDeviation / 100;
            if (randomSeed !== undefined) {
                formData.randomSeed = randomSeed;
            }
        }

        d.submit(formData, {
            action: '/simulate',
            method: 'post',
        })
    }, [d, rendite, returnMode, averageReturn, standardDeviation, randomSeed, simulationAnnual, sparplanElemente, startEnd, yearToday, steuerlast, teilfreistellungsquote])

    useEffect(() => {
        if (d.data === undefined && d.state === 'idle') {
            load({})
        }
    }, [d, load, rendite, returnMode, averageReturn, standardDeviation, randomSeed, simulationAnnual, sparplanElemente, startEnd, steuerlast, teilfreistellungsquote])

    // const data = simulate(
    //     new Date().getFullYear(),
    //     startEnd[0],
    //     sparplanElemente,
    //     rendite / 100,
    //     steuerlast,
    //     simulationAnnual
    // )


    const data = unique(d.data && (d.data.sparplanElements.flatMap(v => v.simulation && Object.keys(v.simulation)).map(Number)))

    return (
        <div>

            <Button
                onClick={() => {
                    setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual))
                    load({})
                }}
            >
                Refresh</Button>

            <Panel header="Eingabe" bordered>
                <Panel header="Variablen" bordered>
                    <Zeitspanne startEnd={startEnd} dispatch={(val) => {
                        setStartEnd(val)
                        setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual))
                    }} />
                    
                    <Panel header="Rendite-Konfiguration" bordered>
                        <Form.Group controlId="returnMode">
                            <Form.ControlLabel>Rendite-Modus</Form.ControlLabel>
                            <RadioGroup 
                                inline 
                                value={returnMode} 
                                onChange={(value) => {
                                    const mode = value as ReturnMode;
                                    setReturnMode(mode);
                                    load();
                                }}
                            >
                                <Radio value="fixed">Feste Rendite</Radio>
                                <Radio value="random">Zufällige Rendite</Radio>
                            </RadioGroup>
                        </Form.Group>

                        {returnMode === 'fixed' ? (
                            <Form.Group controlId="fixedReturn">
                                <Form.ControlLabel>Feste Rendite</Form.ControlLabel>
                                <Slider
                                    name="rendite"
                                    renderTooltip={(value) => value + "%"}
                                    handleTitle={(<div style={{ marginTop: '-17px' }}>{rendite}%</div>)}
                                    progress
                                    value={rendite}
                                    min={0}
                                    max={15}
                                    step={0.5}
                                    graduated
                                    onChange={(r) => {
                                        setRendite(r)
                                        load({ rendite: r })
                                    }}
                                />
                            </Form.Group>
                        ) : (
                            <>
                                <Form.Group controlId="averageReturn">
                                    <Form.ControlLabel>Durchschnittliche Rendite</Form.ControlLabel>
                                    <Slider
                                        name="averageReturn"
                                        renderTooltip={(value) => value + "%"}
                                        handleTitle={(<div style={{ marginTop: '-17px' }}>{averageReturn}%</div>)}
                                        progress
                                        value={averageReturn}
                                        min={0}
                                        max={15}
                                        step={0.5}
                                        graduated
                                        onChange={(value) => {
                                            setAverageReturn(value);
                                            load();
                                        }}
                                    />
                                </Form.Group>
                                
                                <Form.Group controlId="standardDeviation">
                                    <Form.ControlLabel>Volatilität (Standardabweichung)</Form.ControlLabel>
                                    <Slider
                                        name="standardDeviation"
                                        renderTooltip={(value) => value + "%"}
                                        handleTitle={(<div style={{ marginTop: '-17px' }}>{standardDeviation}%</div>)}
                                        progress
                                        value={standardDeviation}
                                        min={5}
                                        max={30}
                                        step={1}
                                        graduated
                                        onChange={(value) => {
                                            setStandardDeviation(value);
                                            load();
                                        }}
                                    />
                                </Form.Group>
                                
                                <Form.Group controlId="randomSeed">
                                    <Form.ControlLabel>Zufallsseed (optional für reproduzierbare Ergebnisse)</Form.ControlLabel>
                                    <InputNumber
                                        placeholder="Leer lassen für echte Zufälligkeit"
                                        value={randomSeed}
                                        onChange={(value) => {
                                            setRandomSeed(value || undefined);
                                            load();
                                        }}
                                        min={1}
                                        max={999999}
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Panel>
                    
                    <Panel header="Steuer-Konfiguration" bordered>
                        <Form.Group controlId="steuerlast">
                            <Form.ControlLabel>Kapitalertragsteuer (%)</Form.ControlLabel>
                            <Slider
                                name="steuerlast"
                                renderTooltip={(value) => value + "%"}
                                handleTitle={(<div style={{ marginTop: '-17px' }}>{steuerlast}%</div>)}
                                progress
                                value={steuerlast}
                                min={20}
                                max={35}
                                step={0.025}
                                graduated
                                onChange={(value) => {
                                    setSteuerlast(value);
                                    load();
                                }}
                            />
                        </Form.Group>
                        
                        <Form.Group controlId="teilfreistellungsquote">
                            <Form.ControlLabel>Teilfreistellungsquote (%)</Form.ControlLabel>
                            <Slider
                                name="teilfreistellungsquote"
                                renderTooltip={(value) => value + "%"}
                                handleTitle={(<div style={{ marginTop: '-17px' }}>{teilfreistellungsquote}%</div>)}
                                progress
                                value={teilfreistellungsquote}
                                min={0}
                                max={50}
                                step={1}
                                graduated
                                onChange={(value) => {
                                    setTeilfreistellungsquote(value);
                                    load();
                                }}
                            />
                        </Form.Group>
                    </Panel>
                    <RadioGroup name="simulationAnnual" inline value={simulationAnnual} onChange={(value) => {
                        const val = value.toString() === SimulationAnnual.yearly ? 'yearly' : 'monthly'
                        setSimulationAnnual(val)
                        setSparplanElemente(convertSparplanToElements(sparplan, startEnd, val))
                    }}>
                        <Radio value={SimulationAnnual.yearly}>jährlich</Radio>
                        <Radio value={SimulationAnnual.monthly}>monatlich</Radio>
                    </RadioGroup>
                </Panel>
                <SparplanEingabe dispatch={(val) => {
                    setSparplan(val)
                    setSparplanElemente(convertSparplanToElements(val, startEnd, simulationAnnual))
                }} />
            </Panel>
            <SparplanEnd elemente={d.data?.sparplanElements} />
            <SparplanSimulationsAusgabe
                elemente={d.data?.sparplanElements}
            />
            <EntnahmeSimulationsAusgabe
                dispatchEnd={setStartEnd}
                startEnd={startEnd}
                elemente={d.data?.sparplanElements || []}
            />

            <Panel header="Simulation" bordered collapsible defaultExpanded>
                <div>
                    {data
                        .sort((a, b) => b - a)
                        .map((year, index) => {
                            return (
                                <div key={year + '' + index}>
                                    Year: {year}
                                    {d.data?.sparplanElements
                                        .map((value) => value.simulation?.[Number(year)])
                                        .filter(Boolean)
                                        .flat()
                                        .map((value, index) => {
                                            if (!value) {
                                                return null;
                                            }
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

            {returnMode === 'random' && (
                <MonteCarloResults
                    years={Array.from({ length: startEnd[0] - yearToday + 1 }, (_, i) => yearToday + i)}
                    randomConfig={{
                        averageReturn: averageReturn / 100,
                        standardDeviation: standardDeviation / 100,
                        seed: randomSeed
                    }}
                />
            )}

            <footer>by Marco</footer>
        </div>
    );
}

export const meta: MetaFunction = () => {
    return [
        { title: "Zins-simulation" },
        { name: "description", content: "simulation des Zinseszins mit monatlichen Sparplan einschließlich Berechnung der Vorabpauschale und weiteren Parametern" },
    ];
};

