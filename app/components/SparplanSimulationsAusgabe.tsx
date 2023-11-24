import { Panel, Table } from "rsuite";
import { Berechnungen, SparplanElement, Summary } from "~/routes/_index";

const { Column, HeaderCell, Cell } = Table;

export function SparplanSimulationsAusgabe({
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

