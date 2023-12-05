import { useState } from "react";
import {
    Form,
    InputNumber,
    Panel,
    RadioTile,
    RadioTileGroup,
    Slider
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import type { SparplanElement } from "./SparplanEingabe";

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


