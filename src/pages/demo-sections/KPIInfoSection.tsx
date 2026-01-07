import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function KPIInfoSection() {
  return (
    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-blue-900 dark:text-blue-100">ℹ️ Über diese KPIs</CardTitle>
      </CardHeader>
      <CardContent className="text-blue-900 dark:text-blue-100 space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Sparquote (Savings Rate)</h3>
          <p className="text-sm">
            Die Sparquote zeigt, welchen Prozentsatz Ihres Einkommens Sie regelmäßig sparen. 
            Eine hohe Sparquote beschleunigt Ihren Vermögensaufbau erheblich. 
            Experten empfehlen eine Sparquote von mindestens 15-20%.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Vermögensaufbau-Rate (Wealth Accumulation Rate)</h3>
          <p className="text-sm">
            Diese KPI zeigt, wie schnell Ihr Vermögen wachsen muss, um Ihr Sparziel zu erreichen. 
            Sie berücksichtigt Ihren aktuellen Vermögensstand, das Ziel und die verbleibende Zeit. 
            Eine realistische Einschätzung hilft bei der Planung Ihrer Sparstrategie.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Erwartete Rentenlücke (Expected Pension Gap)</h3>
          <p className="text-sm">
            Die Rentenlücke ist die Differenz zwischen Ihrem gewünschten Ruhestandseinkommen 
            und der erwarteten gesetzlichen Rente. Diese KPI zeigt, wie viel zusätzliches Kapital 
            Sie benötigen, um Ihren Lebensstandard im Ruhestand aufrechtzuerhalten. 
            Die Berechnung basiert auf der bewährten 4%-Entnahmeregel.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
