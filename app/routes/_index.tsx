import type { MetaFunction } from "@vercel/remix";
import { SimulationAnnual, simulate, type SimulationAnnualType } from "helpers/simulate";
import { useState } from "react";
import {
    Button,
    Panel,
    Radio,
    RadioGroup,
    Slider
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import { EntnahmeSimulationsAusgabe } from "~/components/EntnahmeSimulationsAusgabe";
import type { Sparplan, SparplanElement } from "~/components/SparplanEingabe";
import { SparplanEingabe, convertSparplanToElements, initialSparplan } from "~/components/SparplanEingabe";
import { SparplanSimulationsAusgabe } from "~/components/SparplanSimulationsAusgabe";
import { Zeitspanne } from "~/components/Zeitspanne";

export default function Index() {
    const [rendite, setRendite] = useState(5);
    const steuerlast = 0.26375; // https://de.wikipedia.org/wiki/Kapitalertragsteuer_(Deutschland)#Bemessung_der_Kapitalertragsteuer

    // const Grundfreibetrag = 9744; // erst bei Auszahlung
    const [startEnd, setStartEnd] = useState<[number, number]>([2040, 2080]);

    const [sparplan, setSparplan] = useState<Sparplan[]>([initialSparplan]);

    const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(SimulationAnnual.yearly)
    const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
        convertSparplanToElements([initialSparplan], startEnd, simulationAnnual)
    );

    const data = simulate(
        new Date().getFullYear(),
        startEnd[0],
        sparplanElemente,
        rendite / 100,
        steuerlast,
        simulationAnnual
    )

    return (
        <div>

            <Button
                onClick={() => setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual))}
                >
                Refresh</Button>

            <Panel header="Eingabe" bordered>
                <Panel header="Variablen" bordered>
                    <Zeitspanne startEnd={startEnd} dispatch={(val) => {
                        setStartEnd(val)
                        setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual))
                    }} />
                    <label htmlFor="rendite">Rendite</label>
                    <Slider
                        name="rendite"
                        renderTooltip={(value) => value + "%"}
                        handleTitle={(<div style={{marginTop: '-17px'}}>{rendite}%</div>)}
                        progress
                        defaultValue={rendite}
                        min={3}
                        max={10}
                        step={0.5}
                        graduated
                        onChange={setRendite}
                    />
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

