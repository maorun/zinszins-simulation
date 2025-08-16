import { Panel, Table } from "rsuite";
import type { SparplanElement } from "../utils/sparplan-utils";
import type { Summary } from "../utils/summary-utils";
import { fullSummary, getSparplanSummary } from "../utils/summary-utils";

const { Column, HeaderCell, Cell } = Table;



export function SparplanEnd({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const summary: Summary = fullSummary(elemente)
    return <Panel header="Endkapital" bordered>
        {thousands(summary.endkapital.toFixed(2))} &euro;
    </Panel>
}

export function SparplanSimulationsAusgabe({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const summary: Summary = fullSummary(elemente)
    return (
        <Panel header="Sparplan-Verlauf" bordered>
            <Table
                data={elemente?.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
                ).map((el) => ({
                    ...el,
                    zeitpunkt: new Date(el.start).toLocaleDateString(),
                    zinsen: getSparplanSummary(el.simulation).zinsen.toFixed(2),
                    bezahlteSteuer: getSparplanSummary(
                        el.simulation
                    ).bezahlteSteuer.toFixed(2),
                    endkapital: getSparplanSummary(el.simulation).endkapital?.toFixed(2),
                }))}
                bordered
                headerHeight={60}
            >
                <Column>
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

                <Column>
                    <HeaderCell>
                        <HeaderSummary
                            title="bezahlte Steuer"
                            summary={summary.bezahlteSteuer?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <NumberCell dataKey="bezahlteSteuer" />
                </Column>
                <Column>
                    <HeaderCell>
                        <HeaderSummary
                            title="Zinsen"
                            summary={summary.zinsen?.toFixed(2).toString() || ""}
                        />
                    </HeaderCell>
                    <NumberCell dataKey="zinsen" />
                </Column>
                <Column flexGrow={1}>
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

