import {
    Col,
    InputGroup,
    InputNumber,
    Row,
    Slider
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


