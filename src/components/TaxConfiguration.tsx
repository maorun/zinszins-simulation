import { Panel, Form, Slider, FlexboxGrid, Button, Table, IconButton, InputNumber } from 'rsuite';
import { useSimulation } from '../contexts/SimulationContext';

const TaxConfiguration = () => {
    const {
        performSimulation,
        steuerlast,
        setSteuerlast,
        teilfreistellungsquote,
        setTeilfreistellungsquote,
        freibetragPerYear,
        setFreibetragPerYear,
    } = useSimulation();

    const yearToday = new Date().getFullYear();

    return (
        <Panel header="💰 Steuer-Konfiguration" bordered>
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
                        performSimulation();
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
                        performSimulation();
                    }}
                />
            </Form.Group>

            <Form.Group controlId="freibetragConfiguration">
                <Form.ControlLabel>Freibetrag pro Jahr (€)</Form.ControlLabel>
                <div style={{ marginBottom: '10px' }}>
                    <FlexboxGrid>
                        <FlexboxGrid.Item colspan={8}>
                            <InputNumber
                                placeholder="Jahr"
                                min={yearToday}
                                max={2100}
                                value={undefined}
                                onChange={(value) => {
                                    const year = Number(value);
                                    if (year && !freibetragPerYear[year]) {
                                        setFreibetragPerYear({
                                            ...freibetragPerYear,
                                            [year]: 2000 // Default value
                                        });
                                        performSimulation();
                                    }
                                }}
                            />
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={2}>
                            <Button
                                onClick={() => {
                                    const year = yearToday;
                                    if (!freibetragPerYear[year]) {
                                        setFreibetragPerYear({
                                            ...freibetragPerYear,
                                            [year]: 2000
                                        });
                                        performSimulation();
                                    }
                                }}
                            >
                                Jahr hinzufügen
                            </Button>
                        </FlexboxGrid.Item>
                    </FlexboxGrid>
                </div>
                <div className="table-container">
                    <Table
                        height={200}
                        data={Object.entries(freibetragPerYear).map(([year, amount]) => ({ year: Number(year), amount }))}
                    >
                        <Table.Column width={100} align="center">
                            <Table.HeaderCell>Jahr</Table.HeaderCell>
                            <Table.Cell dataKey="year" />
                        </Table.Column>
                        <Table.Column width={120} align="center">
                            <Table.HeaderCell>Freibetrag (€)</Table.HeaderCell>
                            <Table.Cell>
                                {(rowData: any) => (
                                    <InputNumber
                                        value={freibetragPerYear[rowData.year]}
                                        min={0}
                                        max={10000}
                                        step={50}
                                        onChange={(value) => {
                                            if (value !== null && value !== undefined) {
                                                setFreibetragPerYear({
                                                    ...freibetragPerYear,
                                                    [rowData.year]: Number(value)
                                                });
                                                performSimulation();
                                            }
                                        }}
                                    />
                                )}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column width={80} align="center">
                            <Table.HeaderCell>Aktionen</Table.HeaderCell>
                            <Table.Cell>
                                {(rowData: any) => (
                                    <IconButton
                                        size="sm"
                                        color="red"
                                        appearance="ghost"
                                        onClick={() => {
                                            const newFreibetrag = { ...freibetragPerYear };
                                            delete newFreibetrag[rowData.year];
                                            setFreibetragPerYear(newFreibetrag);
                                            performSimulation();
                                        }}
                                    >
                                        Löschen
                                    </IconButton>
                                )}
                            </Table.Cell>
                        </Table.Column>
                    </Table>
                </div>
            </Form.Group>
        </Panel>
    );
};

export default TaxConfiguration;
