import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { RadioTileGroup, RadioTile } from "./ui/radio-tile";
import type { WithdrawalFormValue } from "../utils/config-storage";
import { getRMDDescription } from "../../helpers/rmd-tables";

interface RMDWithdrawalConfigurationProps {
  formValue: WithdrawalFormValue;
  updateFormValue: (newValue: WithdrawalFormValue) => void;
}

export function RMDWithdrawalConfiguration({ 
  formValue, 
  updateFormValue 
}: RMDWithdrawalConfigurationProps) {
  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const age = Number(event.target.value);
    updateFormValue({
      ...formValue,
      rmdStartAge: age
    });
  };

  const handleTableChange = (value: string) => {
    updateFormValue({
      ...formValue,
      rmdLifeExpectancyTable: value as 'german_2020_22' | 'custom'
    });
  };

  const handleCustomLifeExpectancyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const years = Number(event.target.value);
    updateFormValue({
      ...formValue,
      rmdCustomLifeExpectancy: years
    });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="rmdStartAge">Alter zu Beginn der Entnahmephase</Label>
        <Input
          id="rmdStartAge"
          type="number"
          value={formValue.rmdStartAge}
          onChange={handleAgeChange}
          min={50}
          max={100}
          step={1}
          className="w-32"
        />
        <div className="text-sm text-muted-foreground">
          Das Alter, mit dem die RMD-Entnahme beginnt (Standard: 65 Jahre)
        </div>
      </div>

      <div className="space-y-2">
        <Label>Datengrundlage für Lebenserwartung</Label>
        <RadioTileGroup
          value={formValue.rmdLifeExpectancyTable}
          onValueChange={handleTableChange}
        >
          <RadioTile value="german_2020_22" label="Deutsche Sterbetafel">
            Offizielle Sterbetafel 2020-2022 vom Statistischen Bundesamt
          </RadioTile>
          <RadioTile value="custom" label="Benutzerdefiniert">
            Eigene Lebenserwartung festlegen
          </RadioTile>
        </RadioTileGroup>
      </div>

      {formValue.rmdLifeExpectancyTable === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="rmdCustomLifeExpectancy">Verbleibende Lebenserwartung (Jahre)</Label>
          <Input
            id="rmdCustomLifeExpectancy"
            type="number"
            value={formValue.rmdCustomLifeExpectancy || 20}
            onChange={handleCustomLifeExpectancyChange}
            min={1}
            max={50}
            step={0.1}
            className="w-32"
          />
          <div className="text-sm text-muted-foreground">
            Anzahl der Jahre, die das Portfolio vorhalten soll
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 rounded-md">
        <div className="text-sm font-medium text-blue-900 mb-1">
          Entnahme-Berechnung
        </div>
        <div className="text-sm text-blue-800">
          {getRMDDescription(formValue.rmdStartAge)}
        </div>
        <div className="text-xs text-blue-700 mt-2">
          Die jährliche Entnahme wird berechnet als: <strong>Portfoliowert ÷ Divisor (Lebenserwartung)</strong>
          <br />
          Der Divisor sinkt mit jedem Jahr, wodurch die Entnahme steigt und das Portfolio bis zum Lebensende aufgebraucht wird.
        </div>
      </div>
    </div>
  );
}