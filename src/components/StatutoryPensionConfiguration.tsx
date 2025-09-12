import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Info, Calculator } from "lucide-react";
import { 
  estimateMonthlyPensionFromTaxReturn, 
  estimateTaxablePercentageFromTaxReturn,
  calculatePensionStartYear 
} from "../../helpers/statutory-pension";

interface StatutoryPensionFormValues {
  enabled: boolean;
  startYear: number;
  monthlyAmount: number;
  annualIncreaseRate: number;
  taxablePercentage: number;
  retirementAge?: number;
  birthYear?: number;
  // Tax return data fields
  hasTaxReturnData: boolean;
  taxYear: number;
  annualPensionReceived: number;
  taxablePortion: number;
}

interface StatutoryPensionChangeHandlers {
  onEnabledChange: (enabled: boolean) => void;
  onStartYearChange: (year: number) => void;
  onMonthlyAmountChange: (amount: number) => void;
  onAnnualIncreaseRateChange: (rate: number) => void;
  onTaxablePercentageChange: (percentage: number) => void;
  onRetirementAgeChange: (age: number) => void;
  onBirthYearChange: (year: number) => void;
  onTaxReturnDataChange: (data: {
    hasTaxReturnData: boolean;
    taxYear: number;
    annualPensionReceived: number;
    taxablePortion: number;
  }) => void;
}

interface StatutoryPensionConfigurationProps {
  values: StatutoryPensionFormValues;
  onChange: StatutoryPensionChangeHandlers;
  currentYear?: number;
}

export function StatutoryPensionConfiguration({ 
  values, 
  onChange,
  currentYear = new Date().getFullYear()
}: StatutoryPensionConfigurationProps) {

  const handleImportFromTaxReturn = () => {
    if (values.hasTaxReturnData && values.annualPensionReceived > 0) {
      const estimatedMonthly = estimateMonthlyPensionFromTaxReturn({
        taxYear: values.taxYear,
        annualPensionReceived: values.annualPensionReceived,
        taxablePortion: values.taxablePortion,
      });
      
      const estimatedTaxablePercentage = estimateTaxablePercentageFromTaxReturn({
        taxYear: values.taxYear,
        annualPensionReceived: values.annualPensionReceived,
        taxablePortion: values.taxablePortion,
      });

      onChange.onMonthlyAmountChange(Math.round(estimatedMonthly));
      onChange.onTaxablePercentageChange(Math.round(estimatedTaxablePercentage));
    }
  };

  const handleCalculateStartYear = () => {
    if (values.birthYear && values.retirementAge) {
      const calculatedStartYear = calculatePensionStartYear(values.birthYear, values.retirementAge);
      onChange.onStartYearChange(calculatedStartYear);
    }
  };

  if (!values.enabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={values.enabled}
            onCheckedChange={onChange.onEnabledChange}
            id="statutory-pension-enabled"
          />
          <Label htmlFor="statutory-pension-enabled">
            Gesetzliche Rente berücksichtigen
          </Label>
        </div>
        <div className="text-sm text-muted-foreground">
          Aktivieren Sie diese Option, um Ihre gesetzliche Rente in die Entnahmeplanung einzubeziehen.
          Dies ermöglicht eine realistische Berechnung Ihres privaten Entnahmebedarfs.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          checked={values.enabled}
          onCheckedChange={onChange.onEnabledChange}
          id="statutory-pension-enabled"
        />
        <Label htmlFor="statutory-pension-enabled" className="font-medium">
          Gesetzliche Rente berücksichtigen
        </Label>
      </div>

      {/* Tax Return Data Import */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Daten aus Steuerbescheid importieren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={values.hasTaxReturnData}
              onCheckedChange={(hasTaxReturnData) => 
                onChange.onTaxReturnDataChange({
                  hasTaxReturnData,
                  taxYear: values.taxYear,
                  annualPensionReceived: values.annualPensionReceived,
                  taxablePortion: values.taxablePortion,
                })
              }
              id="has-tax-return-data"
            />
            <Label htmlFor="has-tax-return-data">
              Daten aus Steuerbescheid verfügbar
            </Label>
          </div>

          {values.hasTaxReturnData && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-year">Steuerjahr</Label>
                  <Input
                    id="tax-year"
                    type="number"
                    value={values.taxYear}
                    onChange={(e) => onChange.onTaxReturnDataChange({
                      hasTaxReturnData: values.hasTaxReturnData,
                      taxYear: Number(e.target.value),
                      annualPensionReceived: values.annualPensionReceived,
                      taxablePortion: values.taxablePortion,
                    })}
                    min={2000}
                    max={currentYear}
                    step={1}
                    className="w-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual-pension-received">Jahresrente (brutto) €</Label>
                  <Input
                    id="annual-pension-received"
                    type="number"
                    value={values.annualPensionReceived}
                    onChange={(e) => onChange.onTaxReturnDataChange({
                      hasTaxReturnData: values.hasTaxReturnData,
                      taxYear: values.taxYear,
                      annualPensionReceived: Number(e.target.value),
                      taxablePortion: values.taxablePortion,
                    })}
                    min={0}
                    step={100}
                    className="w-40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxable-portion">Steuerpflichtiger Anteil €</Label>
                  <Input
                    id="taxable-portion"
                    type="number"
                    value={values.taxablePortion}
                    onChange={(e) => onChange.onTaxReturnDataChange({
                      hasTaxReturnData: values.hasTaxReturnData,
                      taxYear: values.taxYear,
                      annualPensionReceived: values.annualPensionReceived,
                      taxablePortion: Number(e.target.value),
                    })}
                    min={0}
                    step={100}
                    className="w-40"
                  />
                </div>
              </div>

              <Button 
                onClick={handleImportFromTaxReturn}
                disabled={values.annualPensionReceived === 0}
                className="w-full md:w-auto"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Werte automatisch berechnen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Pension Configuration */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Year Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pension-start-year">Rentenbeginn (Jahr)</Label>
              <Input
                id="pension-start-year"
                type="number"
                value={values.startYear}
                onChange={(e) => onChange.onStartYearChange(Number(e.target.value))}
                min={currentYear}
                max={currentYear + 50}
                step={1}
                className="w-32"
              />
            </div>

            {/* Helper for calculating start year */}
            <div className="p-3 bg-blue-50 rounded-lg space-y-2">
              <div className="text-sm font-medium text-blue-900">Rentenbeginn automatisch berechnen</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="birth-year" className="text-xs">Geburtsjahr</Label>
                  <Input
                    id="birth-year"
                    type="number"
                    value={values.birthYear || ''}
                    onChange={(e) => onChange.onBirthYearChange(Number(e.target.value))}
                    placeholder="1974"
                    min={1940}
                    max={currentYear - 18}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="retirement-age" className="text-xs">Renteneintrittsalter</Label>
                  <Input
                    id="retirement-age"
                    type="number"
                    value={values.retirementAge || 67}
                    onChange={(e) => onChange.onRetirementAgeChange(Number(e.target.value))}
                    min={60}
                    max={75}
                    className="text-xs h-8"
                  />
                </div>
              </div>
              <Button 
                size="sm"
                variant="outline"
                onClick={handleCalculateStartYear}
                disabled={!values.birthYear || !values.retirementAge}
                className="w-full text-xs"
              >
                Berechnen
              </Button>
            </div>
          </div>

          {/* Monthly Amount Configuration */}
          <div className="space-y-2">
            <Label htmlFor="monthly-amount">Monatliche Rente (brutto) €</Label>
            <Input
              id="monthly-amount"
              type="number"
              value={values.monthlyAmount}
              onChange={(e) => onChange.onMonthlyAmountChange(Number(e.target.value))}
              min={0}
              step={50}
              className="w-40"
            />
            <div className="text-sm text-muted-foreground">
              Jährliche Rente: {(values.monthlyAmount * 12).toLocaleString('de-DE')} €
            </div>
          </div>
        </div>

        {/* Annual Increase Rate */}
        <div className="space-y-2">
          <Label>Jährliche Rentenanpassung (%)</Label>
          <div className="space-y-2">
            <Slider
              value={[values.annualIncreaseRate]}
              onValueChange={(vals) => onChange.onAnnualIncreaseRateChange(vals[0])}
              min={0}
              max={5}
              step={0.1}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium text-gray-900">{values.annualIncreaseRate.toFixed(1)}%</span>
              <span>5%</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Historisch schwanken Rentenerhöhungen zwischen 0-4% pro Jahr.
          </div>
        </div>

        {/* Taxable Percentage */}
        <div className="space-y-2">
          <Label>Steuerpflichtiger Anteil (%)</Label>
          <div className="space-y-2">
            <Slider
              value={[values.taxablePercentage]}
              onValueChange={(vals) => onChange.onTaxablePercentageChange(vals[0])}
              min={50}
              max={100}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>50%</span>
              <span className="font-medium text-gray-900">{values.taxablePercentage.toFixed(0)}%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Der steuerpflichtige Anteil hängt vom Rentenbeginn ab. Aktuelle Werte: ~80%.
          </div>
        </div>
      </div>

      {/* Summary Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Zusammenfassung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Rentenbeginn:</span> {values.startYear}
            </div>
            <div>
              <span className="font-medium">Monatliche Rente:</span> {values.monthlyAmount.toLocaleString('de-DE')} €
            </div>
            <div>
              <span className="font-medium">Jährliche Rente:</span> {(values.monthlyAmount * 12).toLocaleString('de-DE')} €
            </div>
            <div>
              <span className="font-medium">Steuerpflichtiger Betrag:</span>{' '}
              {Math.round(values.monthlyAmount * 12 * values.taxablePercentage / 100).toLocaleString('de-DE')} €/Jahr
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}