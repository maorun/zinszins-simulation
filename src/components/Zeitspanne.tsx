import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <div className="space-y-4">
            <Label>
                Zeitspanne
            </Label>
            <div className="px-3">
                <Slider
                    min={min}
                    max={max}
                    step={1}
                    value={[startOfIndependence]}
                    onValueChange={(value) => {
                        dispatch([value[0], endOfLife]);
                    }}
                    className="w-full"
                />
            </div>
            <Input
                type="number"
                min={min}
                max={max}
                value={startEnd[0]}
                onChange={(e) => {
                    const nextValue = Number(e.target.value);
                    const [, end] = startEnd;
                    if (nextValue > end || nextValue < min || nextValue > max) {
                        return;
                    }
                    dispatch([nextValue, end]);
                }}
                className="w-32"
            />
        </div>
    );
}


