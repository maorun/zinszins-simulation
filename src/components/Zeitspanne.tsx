import {
    InputNumber,
    Slider,
    Form
} from "rsuite";

export function Zeitspanne({
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
        <Form.Group>
            <Form.ControlLabel>Ende der Sparphase</Form.ControlLabel>
            <Slider
                min={min}
                max={max}
                progress
                style={{ marginTop: 16, marginBottom: 16 }}
                value={startOfIndependence}
                onChange={(value) => {
                    dispatch([value, endOfLife]);
                }}
            />
            <InputNumber
                min={min}
                max={max}
                value={startEnd[0]}
                onChange={(nextValue) => {
                    nextValue = Number(nextValue);
                    const [, end] = startEnd;
                    if (nextValue > end || nextValue < min || nextValue > max) {
                        return;
                    }
                    dispatch([nextValue, end]);
                }}
            />
            <Form.HelpText>
                Definiert das Ende der Sparphase (Jahr {startOfIndependence}). Die Entnahme-Phase beginnt automatisch im Folgejahr ({startOfIndependence + 1}).
            </Form.HelpText>
        </Form.Group>
    );
}


