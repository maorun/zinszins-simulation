import { Panel, Form, Slider, RadioGroup, Radio, InputNumber, FlexboxGrid, Button, Table, IconButton } from 'rsuite';
import { useSimulation } from '../contexts/SimulationContext';
import { Zeitspanne } from './Zeitspanne';
import { convertSparplanToElements } from '../utils/sparplan-utils';
import type { ReturnMode } from '../utils/random-returns';

const SimulationParameters = () => {
  const {
    startEnd,
    setStartEnd,
    sparplan,
    simulationAnnual,
    setSparplanElemente,
    returnMode,
    setReturnMode,
    performSimulation,
    rendite,
    setRendite,
    averageReturn,
    setAverageReturn,
    standardDeviation,
    setStandardDeviation,
    randomSeed,
    setRandomSeed,
    variableReturns,
    setVariableReturns,
    steuerlast,
    setSteuerlast,
    teilfreistellungsquote,
    setTeilfreistellungsquote,
    freibetragPerYear,
    setFreibetragPerYear,
    setSimulationAnnual,
  } = useSimulation();

  const yearToday = new Date().getFullYear();

  return (
    <Panel header="⚙️ Konfiguration" collapsible bordered>
      <div className="form-grid">
        <Panel header="📅 Zeitspanne" bordered>
          <Zeitspanne startEnd={startEnd} dispatch={(val) => {
            setStartEnd(val);
            setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual));
          }} />
        </Panel>

        <Panel header="📈 Rendite-Konfiguration" bordered>
          <Form.Group controlId="returnMode">
            <Form.ControlLabel>Rendite-Modus</Form.ControlLabel>
            <RadioGroup
              inline
              value={returnMode}
              onChange={(value) => {
                const mode = value as ReturnMode;
                setReturnMode(mode);
                performSimulation();
              }}
            >
              <Radio value="fixed">Feste Rendite</Radio>
              <Radio value="random">Zufällige Rendite</Radio>
              <Radio value="variable">Variable Rendite</Radio>
            </RadioGroup>
          </Form.Group>

          {returnMode === 'fixed' && (
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
                  setRendite(r);
                  performSimulation({ rendite: r });
                }}
              />
            </Form.Group>
          )}

          {returnMode === 'random' && (
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
                    performSimulation();
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
                    performSimulation();
                  }}
                />
              </Form.Group>

              <Form.Group controlId="randomSeed">
                <Form.ControlLabel>Zufallsseed (optional für reproduzierbare Ergebnisse)</Form.ControlLabel>
                <InputNumber
                  placeholder="Leer lassen für echte Zufälligkeit"
                  value={randomSeed}
                  onChange={(value) => {
                    setRandomSeed(typeof value === 'number' ? value : undefined);
                    performSimulation();
                  }}
                  min={1}
                  max={999999}
                />
              </Form.Group>
            </>
          )}

          {returnMode === 'variable' && (
            <Form.Group controlId="variableReturns">
              <Form.ControlLabel>Variable Renditen pro Jahr</Form.ControlLabel>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e5ea', borderRadius: '6px', padding: '10px' }}>
                {Array.from({ length: startEnd[0] - yearToday + 1 }, (_, i) => {
                  const year = yearToday + i;
                  return (
                    <div key={year} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                      <div style={{ minWidth: '60px', fontWeight: 'bold' }}>{year}:</div>
                      <div style={{ flex: 1 }}>
                        <Slider
                          value={variableReturns[year] || 5}
                          min={-10}
                          max={20}
                          step={0.5}
                          onChange={(value) => {
                            const newReturns = { ...variableReturns, [year]: value };
                            setVariableReturns(newReturns);
                            performSimulation();
                          }}
                        />
                      </div>
                      <div style={{ minWidth: '50px', textAlign: 'right' }}>
                        {(variableReturns[year] || 5).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                Tipp: Verwende negative Werte für wirtschaftliche Krisen und höhere Werte für Boom-Jahre.
              </div>
            </Form.Group>
          )}
        </Panel>

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

        <Panel header="⚙️ Simulation-Konfiguration" bordered>
          <Form.Group controlId="simulationAnnual">
            <Form.ControlLabel>Berechnungsmodus</Form.ControlLabel>
            <RadioGroup
              inline
              value={simulationAnnual}
              onChange={(value) => {
                setSimulationAnnual(value as any);
                setSparplanElemente(convertSparplanToElements(sparplan, startEnd, value as any));
              }}
            >
              <Radio value={'yearly'}>Jährlich</Radio>
              <Radio value={'monthly'}>Monatlich</Radio>
            </RadioGroup>
          </Form.Group>
        </Panel>
      </div>
    </Panel>
  );
};

export default SimulationParameters;
