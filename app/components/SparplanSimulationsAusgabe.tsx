import type { SimulationResult, SimulationResultElement } from "helpers/simulate";
import { Panel, Table } from "rsuite";
import type { SparplanElement } from "./SparplanEingabe";

export type Summary = {
    startkapital: number;
    zinsen: number;
    bezahlteSteuer: number;
    endkapital: number;
};


const { Column, HeaderCell, Cell } = Table;
    function getSparplanSummary (element: SimulationResult): Summary {
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
    }
export function fullSummary(elemente: SparplanElement[]): Summary {
    return elemente
        .map((element) => element.simulation)
        .map(getSparplanSummary)
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

}

export function SparplanSimulationsAusgabe({
    elemente,
}: {
        elemente: SparplanElement[];
    }) {
    const summary: Summary = fullSummary(elemente)
    return (
        <Panel header="Sparplan-Verlauf" bordered>
            <Table
                data={elemente.sort((a,b) => b.start.getTime() - a.start.getTime()
                ).map((el) => ({
                        ...el,
                        zeitpunkt: el.start.toLocaleDateString(),
                        zinsen: getSparplanSummary(el.simulation).zinsen.toFixed(2),
                        bezahlteSteuer: getSparplanSummary(
                            el.simulation
                        ).bezahlteSteuer.toFixed(2),
                        endkapital: getSparplanSummary(el.simulation).endkapital?.toFixed(2),
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

