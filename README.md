# Zinseszins-Rechner

Deutscher Zinseszins-Rechner für Sparpläne und Kapitalanlagen mit umfassender Steuerberechnung und Entnahmeplanung.

**Live-Version:** https://zinszins-simulation.vercel.app/

---

## Implementierte Features

### Zeitspanne und Berechnungsmodus

- Flexibler Zeitraum-Selektor
- Monatliche und jährliche Berechnungen

### Rendite-Konfigurationen

- **Feste Rendite** - Konstante jährliche Rendite
- **Zufällige Rendite** - Monte Carlo Simulation mit Volatilität
- **Variable Rendite** - Jahr-für-Jahr konfigurierbare Renditen
- **Historische Daten** - Backtesting mit DAX, S&P 500, MSCI World (2000-2023)
- **Multi-Asset Portfolio** - Diversifiziertes Portfolio mit automatischem Rebalancing
  - **7 Anlageklassen** - Deutsche/Europäische Aktien, Internationale Aktien, Staatsanleihen, Unternehmensanleihen, REITs, Rohstoffe, Liquidität
  - **Alternative Investments Informationen** - Integrierte Bildungsinhalte zu REITs und Rohstoffen
    - **REITs (Real Estate Investment Trusts)** - Erklärung von Immobilienfonds, Vorteilen und deutscher Steuerbehandlung
    - **Rohstoffe (Commodities)** - Information zu Gold, Öl, Industriemetalle mit Risiko- und Steuerhinweisen
    - **Risikohinweise** - Transparente Darstellung von Volatilität, Komplexität und empfohlener Portfolio-Allokation (5-15%)
    - **Anwendungsempfehlungen** - Klare Hinweise wann alternative Investments sinnvoll sind (Diversifikation, Inflationsschutz, langfristiger Horizont)
  - **Individuelle Konfiguration** - Separate Einstellung von erwarteter Rendite, Volatilität und Zielallokation für jede Anlageklasse
  - **Portfolio-Übersicht** - Real-time Berechnung der erwarteten Portfolio-Rendite und des Portfolio-Risikos
  - **Portfolio-Optimierung** - Automatische Optimierung der Asset Allocation
    - **3 Optimierungsziele** - Maximale Sharpe Ratio, Minimales Risiko, Maximale Rendite
    - **Korrelationsberücksichtigend** - Nutzt Korrelationsmatrix für realistische Portfolio-Varianz-Berechnung
    - **Gradient-basierte Optimierung** - Effiziente Optimierung mit finiten Differenzen
    - **Ergebnisanzeige** - Erwartete Rendite, Risiko, Sharpe Ratio und optimierte Allokationen
    - **Ein-Klick-Anwendung** - Optimierte Allokationen können direkt übernommen werden
  - **Automatisches Rebalancing** - Konfigurierbare Rebalancing-Häufigkeit (jährlich, quartalsweise, monatlich) mit Schwellenwert-basiertem Rebalancing
    - **Rebalancing-Protokoll** - Detaillierte Dokumentation aller Rebalancing-Transaktionen
      - **Transaktionshistorie** - Vollständige Aufzeichnung aller Käufe und Verkäufe bei jedem Rebalancing
      - **Steuerberechnung** - Automatische Berechnung von Kapitalerträgen und Steuern (Kapitalertragsteuer + Solidaritätszuschlag)
      - **Teilfreistellung** - Berücksichtigung der deutschen Teilfreistellung (30% für Aktienfonds, 60% für Immobilienfonds)
      - **Kosten-Transparenz** - Darstellung der steuerlichen Kosten jeder Rebalancing-Aktion
      - **Allokations-Tracking** - Dokumentation der Portfolio-Allokationen vor und nach dem Rebalancing
  - **Korrelationsmatrix** - Berücksichtigung historischer Korrelationen zwischen Anlageklassen für realistische Simulationen
  - **Korrelations-Heatmap** - Visuelle Darstellung der Korrelationsmatrix mit farbcodierter Heatmap
    - **Interaktive Visualisierung** - Zeigt Korrelationen zwischen allen aktivierten Anlageklassen
    - **Farbcodierung** - Positive Korrelationen in Blau, negative in Rot mit Intensität basierend auf Stärke
    - **Tooltips** - Detaillierte Informationen zu jeder Korrelation beim Hover
    - **Responsive Design** - Automatische Anpassung an Bildschirmgröße mit horizontalem Scrolling
    - **Dynamische Anzeige** - Nur sichtbar wenn Korrelationen aktiviert sind und mindestens 2 Anlageklassen gewählt
  - **Deutsche Steuerregeln** - Vollständige Integration der Teilfreistellung für Aktien und REITs
  - **Portfolio-Validierung** - Automatische Validierung der Allokationen mit deutschen Fehlermeldungen
  - **Normalisierungsfunktion** - Ein-Klick Normalisierung der Allokationen auf 100%
  - **Volatilitäts-Targeting** - Dynamische Allokationsanpassung basierend auf realisierter Volatilität
    - **4 Strategien** - Keine, Einfache Skalierung, Inverse Volatilitätsgewichtung, Risk Parity
    - **Ziel-Volatilität** - Konfigurierbar zwischen 1% und 50% jährlich
    - **Lookback-Periode** - 1-10 Jahre zur Berechnung der realisierten Volatilität
    - **Allokationsgrenzen** - Minimale und maximale Risikoallokation konfigurierbar
    - **Glättungsfaktor** - Exponentiell gewichtete Volatilitätsschätzung für stabilere Anpassungen
    - **Automatische Anpassung** - Reduziert Risikoexposition bei hoher Volatilität, erhöht bei niedriger
  - **Faktor-Investing** - Wissenschaftlich fundierte Faktor-Strategien zur Portfolio-Optimierung
    - **4 Investment-Faktoren** - Value, Growth, Small-Cap, Momentum basierend auf akademischer Forschung (Fama-French, Carhart)
    - **Konfigurierbare Factor-Exposure** - Individuelle Steuerung der Faktor-Gewichtung (0-100%)
    - **Historische Prämien** - Basierend auf langfristigen europäischen Marktdaten
      - Value: +2,5% jährliche Prämie (niedrige Bewertungskennzahlen)
      - Growth: +1,5% jährliche Prämie (hohes Gewinnwachstum)
      - Small-Cap: +3,0% jährliche Prämie (kleinere Marktkapitalisierung)
      - Momentum: +4,0% jährliche Prämie (positive Kursentwicklung)
    - **Risiko-Berücksichtigung** - Zusätzliche Volatilität je Faktor wird transparent dargestellt
    - **Portfolio-Statistiken** - Echtzeit-Berechnung von erwarteter Rendite, Risiko und Sharpe Ratio
    - **Validierung** - Automatische Prüfung auf konfliktäre Faktor-Kombinationen (z.B. Value vs. Growth)
    - **Akademische Grundlage** - Fama-French Three-Factor Model, Carhart Four-Factor Model
    - **Langfristiger Ansatz** - Faktoren funktionieren am besten über Anlagehorizonte von 10+ Jahren
- **Inflation** - Berücksichtigung während der Ansparphase mit automatischer Anpassung
  - **Inflationsbereinigte Werte** - Zusätzliche Anzeige der realen Kaufkraft (inflationsbereinigt) neben Nominalwerten
  - **Sparphase**: Alle Kapitalwerte werden sowohl nominal als auch real angezeigt (z.B. "793.512,75 € / 589.591,66 € real")
  - **Entnahmephase**: Entnahmebeträge und Kapitalwerte zeigen sowohl nominale als auch reale Kaufkraft
- **Benchmark-Integration** - Vergleich der Portfolio-Performance gegen bekannte Marktindizes
  - **6 Standard-Benchmarks** - DAX, MSCI World, MSCI ACWI, S&P 500, STOXX Europe 600, MSCI Emerging Markets
  - **Historische Renditen** - Verwendung historischer Indexrenditen für Jahre 2000-2023
  - **Langfristige Durchschnitte** - Automatische Verwendung von Durchschnittsrenditen für zukünftige Jahre
  - **Benutzerdefinierte Benchmarks** - Individuelle Benchmarks mit eigener erwarteter Rendite
  - **Performance-Metriken**:
    - Durchschnittliche Portfolio-Rendite vs. Benchmark-Rendite
    - Outperformance/Underperformance in Prozentpunkten
    - Jahr-für-Jahr Vergleich der Renditen
    - Tracking Error (Volatilität der Renditedifferenzen)
    - Anzahl der Jahre mit Over-/Underperformance
  - **Kumulativer Wertverlauf** - Vergleich der Kapitalentwicklung (normiert auf 1,0)
  - **Detaillierte jährliche Aufschlüsselung** - Transparente Darstellung aller Berechnungen
  - **Bildungsfunktion** - Hilft Anlegern zu verstehen, ob ihre Strategie besser/schlechter als der Markt abschneidet

### Sparplan, Einmalzahlungen und Sonderereignisse

- **Dynamische Sparraten** - Automatische Anpassung der Sparrate an Lebensumstände
  - **Lebensabschnitt-basierte Anpassungen** - Sparrate passt sich automatisch an Lebensphase an
    - Berufsstart (25-29 Jahre): 60% der Basis-Sparrate (geringeres Einkommen)
    - Karrieremitte (30-49 Jahre): 100% der Basis-Sparrate (höheres Einkommen)
    - Pre-Retirement (50-67 Jahre): 130% der Basis-Sparrate (maximale Sparleistung vor Ruhestand)
  - **Einkommensentwicklung** - Automatische Erhöhung der Sparrate bei Gehaltssteigerungen
    - Konfigurierbare Sparquote der Gehaltserhöhung (z.B. 50% jeder Erhöhung zusätzlich sparen)
    - Altersabhängige Gehaltsent wicklung (4% Berufsstart, 2.5% Karrieremitte, 1.5% Pre-Retirement)
    - Kumulative Anpassungen über die Jahre
  - **Lebensereignis-getriggerte Anpassungen** - Sparrate reagiert auf einmalige Ereignisse
    - Geburt: Reduktion der Sparrate (z.B. -500€/Jahr)
    - Auszug der Kinder: Erhöhung der Sparrate (z.B. +800€/Jahr)
    - Kreditabbezahlung: Umleitung der Raten in Sparplan (z.B. +500€/Jahr)
    - Erbschaft: Einmalige oder dauerhafte Sparraten-Anpassung
  - **Transparente Berechnung** - Detaillierte Aufschlüsselung aller Anpassungsfaktoren
  - **Validierung** - Automatische Prüfung der Konfiguration mit deutschen Fehlermeldungen
  - **Realistische Modellierung** - Ermöglicht präzise Planung mit sich ändernden Lebensumständen
- **Notgroschen & Liquiditätsplanung** - Intelligente Verwaltung des Notfallfonds
  - **Bedarfsberechnung** - Automatische Ermittlung des optimalen Notgroschens basierend auf monatlichen Ausgaben
  - **Beschäftigungsstatus** - Anpassung nach Angestellter (3-6 Monate), Selbstständig (6-12 Monate), Rentner (1-3 Monate)
  - **Reserve-Strategien** - Drei Strategien: Konservativ (maximale Liquidität), Ausgewogen (Balance), Aggressiv (optimierte Rendite)
  - **Status-Tracking** - Echtzeit-Anzeige des Fortschritts zum Ziel-Notfallfonds mit abgedeckten Monaten
  - **Drei-Stufen-Liquiditätssystem** - Empfohlene Aufteilung über drei Liquiditätsstufen:
    - **Stufe 1: Girokonto** - Sofort verfügbar für tägliche Ausgaben (0% Rendite)
    - **Stufe 2: Tagesgeldkonto** - Hohe Verfügbarkeit mit aktuellen Tagesgeld-Zinsen (~3-4%)
    - **Stufe 3: Kurzfristige Anlagen** - Geldmarkt-ETF oder kurzfristige Anleihen (~4-5%)
  - **Investitionsschutz** - Option zum Ausschluss des Notfallfonds von risikobehafteten Investitionen
  - **Visuelle Darstellung** - Farbcodierte Drei-Tier-Visualisierung mit Allokationsempfehlungen
  - **Warnhinweise** - Proaktive Empfehlungen zum Aufbau des Notgroschens vor Investitionen
  - **Bildungsinhalte** - Erklärung der Notwendigkeit und optimalen Verwaltung von Liquiditätsreserven
- **Sparpläne** - Regelmäßige monatliche oder jährliche Einzahlungen
- **Schwankende Einkommen (Selbstständige)** - Unregelmäßige Einkommensmuster für Selbstständige
  - **Monatliche Muster** - Definition individueller Multiplikatoren für jeden Monat des Jahres
  - **Quartalsweise Muster** - Vereinfachte Konfiguration auf Quartalsbasis
  - **Vorlagen** - Vordefinierte Muster (saisonales Geschäft, Quartalszyklus)
  - **Flexible Anpassung** - Multiplikatoren von 0 bis 3 (z.B. 1.5 = +50%, 0.5 = -50%)
  - **Nur monatliche Berechnung** - Feature nur verfügbar bei monatlicher Berechnung
  - **Realistische Modellierung** - Ermöglicht präzise Planung bei unregelmäßigem Einkommen
- **Einmalzahlungen** - Einmalige Zahlungen mit Datum und Betrag
- **Sonderereignisse** - Besondere finanzielle Ereignisse im Lebensverlauf
  - **💰 Erbschaften** - Berücksichtigung deutscher Erbschaftsteuer nach Verwandtschaftsgrad
    - Steuerklassen und Freibeträge (Ehegatte €500k, Kind €400k, Enkelkind €200k, etc.)
    - Echtzeit-Berechnung der Erbschaftsteuer nach ErbStG
    - Automatische Netto/Brutto-Umrechnung
  - **🎁 Schenkungssteuer-Planung** - Optimierung lebzeitiger Vermögensübertragungen
    - **10-Jahres-Zyklen** - Strategische Nutzung der Freibeträge alle 10 Jahre zur gleichen Person
    - **Optimierungsalgorithmus** - Automatische Berechnung der steueroptimalen Schenkungsplanung
    - **Steuerersparnis-Vergleich** - Transparenter Vergleich zwischen Einmalübertragung und optimierter Strategie
    - **Freibetragsübersicht** - Darstellung der verfügbaren Freibeträge je Verwandtschaftsgrad
    - **Zeitliche Planung** - Empfohlene Schenkungszeitpunkte über konfigurierbaren Planungszeitraum
    - **Netto-Berechnung** - Exakte Ermittlung der beim Beschenkten ankommenden Beträge
    - **Bildungsinhalte** - Integrierte Hinweise zu Dokumentation, Meldepflichten und rechtlichen Anforderungen
    - **Visualisierung** - Übersichtliche Darstellung des empfohlenen Schenkungsplans mit Zeitstrahl
  - **💸 Ausgaben** - Größere Ausgaben mit optionaler Kreditfinanzierung
    - Kategorien: Autokauf, Immobilie, Bildung, Medizin, Sonstiges
    - Kreditberechnung mit Standard-Zinssätzen je Kategorie
    - Monatliche Ratenzahlung und Gesamtkosten-Aufstellung

### Kostenfaktoren

- **TER (Total Expense Ratio)** - Jährliche Verwaltungskosten in Prozent
- **Transaktionskosten** - Einmalige Kosten beim Kauf (prozentual oder absolut)
- **Kostenaufschlüsselung** - Detaillierte Darstellung aller Kostenfaktoren in der Simulation

### Steuerberechnung

- **Vorabpauschale** - Deutsche Steuerberechnung für Investmentfonds mit detaillierter Erklärung
- **Interaktive Berechnungsmodals** - Schritt-für-Schritt Aufschlüsselung der Steuerberechnungen
- **Steuerprogression-Visualisierung** - Interaktive Visualisierung des deutschen progressiven Steuersystems
  - **Interaktives Diagramm**: Zeigt Durchschnittssteuersatz und Grenzsteuersatz über verschiedene Einkommensniveaus
  - **Drei Ansichtsmodi**:
    - Beide (Steuersätze und Beträge kombiniert)
    - Nur Steuersätze (Durchschnitts- und Grenzsteuersatz)
    - Nur Steuerbeträge (absolute Euro-Werte)
  - **Beispielberechnung**: Eingabe eines Beispiel-Einkommens zur detaillierten Steuerberechnung
    - Zeigt Steuerzone, Steuerbetrag, Durchschnittssteuersatz, Grenzsteuersatz und Nettoeinkommen
    - Erklärt den Unterschied zwischen Durchschnitts- und Grenzsteuersatz
  - **Steuerzonen-Übersicht**: Farbkodierte Legende der 5 deutschen Steuerzonen
  - **Konfigurierbarer Bereich**: Einstellbarer maximaler Einkommensbereich (50.000€ - 1.000.000€)
  - **Grundfreibetrag-Anpassung**: Automatische Berücksichtigung des Grundfreibetrags je nach Planungsmodus (Einzelperson/Paar)
  - **Bildungszweck**: Hilft zu verstehen, wie das progressive Steuersystem funktioniert und wie sich zusätzliches Einkommen auf die Steuerlast auswirkt
- **Konfigurierbare Parameter**: Kapitalertragsteuer, Teilfreistellungsquote, Freibetrag pro Jahr
- **Rürup-Rente (Basis-Rente)** - Als "andere Einkünfte" konfigurierbar
  - **Beitragsphase Steuervorteile**: Berechnung der steuerlichen Absetzbarkeit von Rürup-Beiträgen (74% in 2012 → 100% ab 2025)
  - **Höchstbeiträge**: Berücksichtigung der jährlichen Beitragsgrenzen (€27.566 Ledige / €55.132 Verheiratete in 2024)
  - **Progressive Absetzbarkeit**: Jährlich steigende Absetzbarkeit der Beiträge gemäß § 10 Abs. 1 Nr. 2 Buchst. b EStG
  - **Rentenphase Besteuerung**: Berechnung der Steuerbelastung auf Rürup-Renten mit nachgelagerter Besteuerung
  - **Besteuerungsanteil**: Jahr des Rentenbeginns bestimmt steuerpflichtigen Anteil (50% in 2005 → 100% ab 2040)
  - **Rentenanpassung**: Jährliche Rentenerhöhung gemäß konfigurierter Steigerungsrate
  - **Integration in "Andere Einkünfte"**: Rürup-Rente kann als Einkunftsquelle neben BU-Rente, Kindergeld, etc. hinzugefügt werden
  - **Helper-Funktionen verfügbar**: `calculateRuerupTaxDeduction()`, `calculateRuerupPensionTaxation()`, `getRuerupDeductibilityLimits()`, `getRuerupPensionTaxablePercentage()`
  - **Umfassend getestet**: 36 Tests (32 Helper + 4 Integration) mit 100% Pass-Rate
- **Riester-Rente** - Als "andere Einkünfte" konfigurierbar mit staatlicher Förderung
  - **Zulagenberechnung**: Automatische Berechnung von Grundzulage (175€) und Kinderzulagen (185€/300€)
  - **Mindesteigenbeitrag**: Berechnung des erforderlichen Eigenbeitrags (4% des Bruttoeinkommens minus Zulagen, mindestens 60€)
  - **Günstigerprüfung**: Automatische Wahl zwischen Zulagen und Sonderausgabenabzug (max. 2.100€)
  - **Kinderzulagen**: 185€ für vor 2008 geborene Kinder, 300€ für ab 2008 geborene Kinder
  - **Altersgrenzen**: Kinderzulagen bis 25 Jahre bei Kindergeldberechtigung
  - **Beitragsphase**: Berechnung der staatlichen Förderung durch Zulagen oder Steuerersparnis (je nachdem was günstiger ist)
  - **Rentenphase Besteuerung**: Vollständige Besteuerung (100%) der Riester-Rente in der Auszahlungsphase
  - **Nachgelagerte Besteuerung**: Riester-Renten sind voll steuerpflichtig gemäß § 22 Nr. 5 Satz 1 EStG
  - **Rentenanpassung**: Jährliche Rentenerhöhung gemäß konfigurierter Steigerungsrate
  - **Wohn-Riester Option**: Konfigurierbare Option für Eigenheimrente (für zukünftige Erweiterungen)
  - **Integration in "Andere Einkünfte"**: Riester-Rente kann als Einkunftsquelle neben Rürup-Rente, BU-Rente, Kindergeld, etc. hinzugefügt werden
  - **Helper-Funktionen verfügbar**: `calculateRiesterTaxBenefit()`, `calculateRiesterPensionTaxation()`, `calculateRiesterAllowances()`, `calculateMinimumContribution()`
  - **Umfassend getestet**: 36 Tests (31 Helper + 5 Integration) mit 100% Pass-Rate
- **Günstigerprüfung** - Automatische Wahl zwischen Abgeltungssteuer und persönlichem Steuersatz
  - **Automatische Optimierung**: System vergleicht Abgeltungssteuer (26,375%) vs. individueller Einkommensteuersatz
  - **Progressiver Steuertarif**: Bei aktivierter Günstigerprüfung wird der deutsche progressive Einkommensteuertarif berücksichtigt
  - **Sowohl Spar- als auch Entnahmephase**: Optimierung in beiden Phasen für maximale Steuerersparnis
  - **Transparente Darstellung**: Anzeige beider Berechnungen und Erklärung der gewählten Variante
  - **Konfigurierbare Aktivierung**: Ein-/Ausschaltbar je nach individueller Steuersituation
- **Progressives Steuersystem (2024)**
  - **5 Steuerzonen** nach deutschem Einkommensteuergesetz (EStG §32a)
    - Zone 1: 0 - 11.604€: 0% (Grundfreibetrag)
    - Zone 2: 11.605€ - 17.005€: 14% - 24% (progressiv)
    - Zone 3: 17.006€ - 66.760€: 24% - 42% (progressiv)
    - Zone 4: 66.761€ - 277.825€: 42% (Spitzensteuersatz)
    - Zone 5: Ab 277.826€: 45% (Reichensteuer)
  - **Automatische Anwendung**: Wird bei Günstigerprüfung automatisch verwendet
  - **Effektiver Steuersatz**: Zeigt den tatsächlich angewendeten Steuersatz nach progressiver Berechnung
  - **Besonders vorteilhaft**: Bei niedrigeren Einkommen oft günstiger als Abgeltungssteuer
- **Kirchensteuer** - Berücksichtigung der deutschen Kirchensteuer
  - **Bundesländerspezifisch**: 8% für Bayern/Baden-Württemberg, 9% für andere Bundesländer
  - **Automatische Integration**: Wird bei Günstigerprüfung und Einkommensteuerberechnung berücksichtigt
  - **Konfigurierbar**: Ein-/Ausschaltbar mit präziser Prozentsatz-Einstellung (8-9%)
  - **Transparente Berechnung**: Kirchensteuer wird als Prozentsatz der Einkommensteuer berechnet
- **Solidaritätszuschlag (Soli)** - Informations-Tool zur Berechnung des Solidaritätszuschlags nach 2021 Reform
  - **Freigrenze**: Etwa 90% der Steuerzahler zahlen keinen Soli mehr (Einzelperson: 16.956 €, Ehepaar: 33.912 € Einkommensteuer)
  - **Gleitzone**: Schrittweise Einführung des Soli zwischen Freigrenze und Obergrenze (Einzelperson: 31.527 €, Ehepaar: 63.054 €)
  - **Voller Soli**: 5,5% der Einkommensteuer oberhalb der Gleitzone
  - **Planungsmodus-abhängig**: Unterschiedliche Freigrenzen für Einzelpersonen und Ehepaare/Partner
  - **Interaktive Berechnung**: Slider zur Simulation verschiedener Einkommensteuerhöhen
  - **Transparente Darstellung**:
    - Anzeige der aktuellen Zone (unter Freigrenze, in Gleitzone, über Gleitzone)
    - Berechnung des effektiven Soli-Satzes
    - Ersparnis durch 2021 Reform im Vergleich zu früherem Soli (5,5% auf alle)
    - Detaillierte Erklärung der Berechnungsgrundlage
  - **Bildungsinhalte**: Hintergrundinformationen zur 2021 Reform und den Berechnungsregeln
  - **Helper-Funktionen verfügbar**: `calculateSolidaritaetszuschlag()`, `calculateYearlySoli()`, `calculateSoliSavings()`, `getSoliFreigrenze()`, `getSoliGleitzoneUpper()`
  - **Umfassend getestet**: 62 Tests mit 100% Pass-Rate
- **Versicherungskostenübersicht** - Aggregierte Übersicht aller Versicherungskosten zur Optimierung
  - **Zusammenfassung**: Durchschnittliche jährliche Kosten, höchste jährliche Kosten und Gesamtkosten über den Planungszeitraum
  - **Kategorisierung**: Aufschlüsselung nach Versicherungsarten (Krankenversicherung, Risikolebensversicherung, Pflegeversicherung, etc.)
  - **Integrierte Berechnung**: 
    - Krankenversicherung (gesetzlich und privat) mit realistischen Kosteneinschätzungen
    - Risikolebensversicherung mit alters-, geschlechts- und gesundheitsabhängigen Prämien
    - Zukünftige Erweiterbarkeit für weitere Versicherungstypen
  - **Optimierungsempfehlungen**: Automatische Identifikation von Optimierungspotenzial
    - Warnung bei hohen Versicherungskosten (>30% der Entnahmen)
    - PKV-Kostenprüfung bei hohen Beiträgen im Alter
    - Hinweise zur Risikolebensversicherung im Ruhestand
    - Information bei fehlenden Versicherungskonfigurationen
  - **Helper-Funktionen verfügbar**: `calculateInsuranceCostSummary()`, `generateOptimizationRecommendations()`, `calculateHealthCareInsuranceCost()`, `calculateTermLifeInsuranceCost()`
  - **Umfassend getestet**: 39 Tests (29 Helper + 10 Component) mit 100% Pass-Rate
- **Verlustverrechnung (Tax-Loss Harvesting)** - Informations-Tool zur Berechnung von Steuerersparnissen durch Verlustverrechnung
  - **Verlustverrechnungsregeln**: Detaillierte Darstellung der deutschen Verlustverrechnungsregeln nach EStG
    - Aktienverluste können nur mit Aktiengewinnen verrechnet werden (separater Verlusttopf)
    - Sonstige Kapitalverluste können mit allen Kapitalerträgen verrechnet werden
    - Verluste können mit Vorabpauschale verrechnet werden
    - Nicht genutzte Verluste werden unbegrenzt vorgetragen (Verlustvortrag)
  - **Konfigurierbare Eingaben**:
    - Realisierte Aktienverluste für das aktuelle Jahr
    - Realisierte sonstige Verluste (Anleihen, Fonds, etc.)
    - Verlustvortrag aus Vorjahren
  - **Berechnungsergebnisse**:
    - Verfügbare Verluste gesamt
    - Genutzte Verluste zur Verrechnung
    - Verbleibender Verlustvortrag fürs nächste Jahr
    - Berechnete Steuerersparnis in Euro
    - Detaillierte Aufschlüsselung nach Verlusttyp
  - **Informations-Tool**: Berechnung basiert auf Beispielwerten (10.000 € Kapitalerträge + 500 € Vorabpauschale)
  - **Steuerintegration**: Nutzt aktuelle Steuereinstellungen (Kapitalertragsteuer, Teilfreistellung) aus der Konfiguration
- **Verlustverrechnungstöpfe (Loss Offset Accounts)** - Jahr-für-Jahr Tracking und Verrechnung von Verlusten in der Simulation
  - **Automatisches Verlusttracking**: Verfolgung von Verlusten über die gesamte Simulationsdauer
    - Separate Verwaltung von Aktienverlusttopf und sonstigem Verlusttopf
    - Automatische Verrechnung mit Gewinnen und Vorabpauschale jedes Jahr
    - Unbegrenzter Verlustvortrag in zukünftige Jahre
  - **Integrierte Berechnung**: Nahtlose Integration in die Jahr-für-Jahr-Simulation
    - Verluste reduzieren automatisch die Steuerlast in jedem Jahr
    - Detaillierte Aufschlüsselung der Verlustverwendung pro Jahr
    - Transparente Darstellung der Steuerersparnis durch Verlustverrechnung
  - **Konfigurationsmöglichkeiten**:
    - Initiale Verlustkonten (Verluste vor Simulationsbeginn)
    - Realisierte Verluste pro Jahr (Aktienverluste und sonstige Verluste)
    - Anpassbares Aktienanteil-Verhältnis (Standardwert: 70% Aktiengewinne)
  - **Jahr-für-Jahr Visualisierung**:
    - Kompakte Anzeige in der Simulationstabelle
    - Detaillierte Tooltips mit Verlustverrechnung und Steuerersparnis
    - Anzeige des Verlustvortrags für jedes Jahr
  - **Steueroptimierung**: Hilft bei der strategischen Planung von Verlustverrechnung
    - Verständnis der langfristigen Auswirkungen von realisierten Verlusten
    - Optimierung des Timings von Verkäufen zur Verlustnutzung
    - Transparente Darstellung der kumulativen Steuerersparnis über Jahre
  - **Compliance**: Vollständig konform mit deutschem Steuerrecht (EStG)
    - Korrekte Trennung von Aktienverlusttopf und sonstigem Verlusttopf
    - Präzise Anwendung der Verlustverrechnungsregeln
    - Unbegrenzte Verlustvortragsperiode wie im deutschen Steuerrecht
- **Abfindungs-Rechner (Fünftelregelung)** - Steueroptimierung für Abfindungszahlungen nach §34 EStG
  - **Fünftelregelung (§34 EStG)**: Steuervergünstigung für außerordentliche Einkünfte
    - Steuerberechnung als würde die Abfindung über 5 Jahre verteilt
    - Formel: Steuer = 5 × (Steuer(Einkommen + Abfindung/5) - Steuer(Einkommen))
    - Deutliche Steuerersparnisse gegenüber normaler Besteuerung möglich
  - **Zwei Berechnungsmodi**:
    - **Einzelberechnung**: Detaillierte Berechnung für ein spezifisches Jahr
      - Eingabe von Abfindungshöhe, Jahr und Jahreseinkommen
      - Optionale Berücksichtigung von Kapitalerträgen
      - Vergleich: Fünftelregelung vs. Standardbesteuerung
      - Anzeige der Steuerersparnis in Euro und Prozent
    - **Jahresvergleich**: Optimaler Zeitpunkt für Abfindungserhalt finden
      - Vergleich verschiedener Empfangsjahre
      - Berücksichtigung unterschiedlicher Einkommenssituationen
      - Automatische Identifikation des steuerlich günstigsten Jahres
  - **Detaillierte Ergebnisanzeige**:
    - Bruttoabfindung und Nettoabfindung nach Steuern
    - Einkommensteuer mit Fünftelregelung
    - Effektiver Steuersatz auf die Abfindung
    - Vergleich mit normaler Besteuerung
    - Steuerersparnis durch Fünftelregelung
    - Gesamtsteuerlast inklusive Kapitalertragsteuer
  - **Erweiterte Einstellungen**:
    - Kapitalertragsteuersatz (default: 26,375% inkl. Soli)
    - Sparerpauschbetrag (default: 1.000€ / 2.000€)
    - Anpassbar für individuelle Steuersituationen
  - **Steuerkonformes Berechnungsmodell**:
    - Deutsches progressives Einkommensteuersystem (EStG §32a)
    - Korrekte Berücksichtigung aller Steuerzonen
    - Solidaritätszuschlag mit Freigrenze und Gleitzone
    - Grundfreibetrag (10.908€ in 2023)
  - **Praktische Anwendungsfälle**:
    - Optimierung bei Jobwechsel oder Kündigung
    - Planung des besten Auszahlungszeitpunkts
    - Berücksichtigung von Sabbaticals oder Elternzeit
    - Ruhestandsplanung mit Abfindung
  - **Informations-Tool**: Rein informativer Rechner zur Steuerplanung
  - **Umfassend getestet**: 30 Tests mit 100% Pass-Rate
- **Progressionsvorbehalt** - Informations-Tool zur Berechnung der Steuerauswirkungen steuerfreier progressionsrelevanter Einkünfte
  - **Jahr-für-Jahr Konfiguration**: Individuelle Eingabe progressionsrelevanter Einkünfte für jedes Jahr
  - **Einkunftsarten**: Unterstützung verschiedener Einkunftsarten nach deutschem Steuerrecht
    - Elterngeld (steuerfreie Leistung bei Elternzeit)
    - Arbeitslosengeld I (Leistung bei Arbeitslosigkeit)
    - Kurzarbeitergeld (Lohnersatzleistung bei Kurzarbeit)
    - Ausländische Einkünfte (steuerfreie Einkünfte aus dem Ausland)
    - Weitere progressionsrelevante Einkünfte
  - **Steuerliche Auswirkungen**: Echtzeit-Berechnung des effektiven Steuersatzes mit Progressionsvorbehalt
    - Berechnung erfolgt nach deutschem Einkommensteuergesetz (EStG)
    - Berücksichtigung der progressiven Steuertarife
    - Integration mit Kirchensteuer-Konfiguration
  - **Vergleichsansicht**: Transparente Darstellung der Steuerlast mit und ohne Progressionsvorbehalt
    - Steuersatz ohne Progression (reguläre Besteuerung)
    - Steuersatz mit Progression (erhöhter Steuersatz)
    - Zusätzliche Steuerlast in Euro und Prozentpunkten
  - **Beispielszenarien**: Vordefinierte Szenarien für typische Progressionsvorbehalt-Situationen
    - Elternzeit (1 Jahr mit 12.000 € Elterngeld)
    - Kurzarbeit (6 Monate mit 6.000 € Kurzarbeitergeld)
    - Arbeitslosigkeit (kurze Periode mit 4.500 € Arbeitslosengeld I)
  - **Glossar-Integration**: Detaillierte Erklärung mit Beispielen im integrierten Glossar
  - **Informations-Tool**: Beispielhafte Berechnung mit 40.000 € zu versteuerndem Einkommen
- **Planungsmodus-abhängiger Sparerpauschbetrag** - Automatische Anpassung des Freibetrags basierend auf Individual- oder Paarplanung
  - **Einzelperson**: 2.000€ jährlicher Sparerpauschbetrag
  - **Ehepaar/Partner**: 4.000€ jährlicher Sparerpauschbetrag (2.000€ pro Person)
  - **Automatische Aktualisierung**: Freibeträge werden automatisch angepasst beim Wechsel des Planungsmodus
- **Freistellungsaufträge-Optimierung** - Optimale Verteilung der Freistellungsaufträge über mehrere Bankkonten
  - **Multi-Bank-Verwaltung**: Verwaltung mehrerer Depot-/Bankkonten mit separaten Freistellungsaufträgen
  - **Automatische Optimierung**: Intelligente Verteilung des Sparerpauschbetrags auf Konten mit höchsten erwarteten Erträgen
  - **Echtzeit-Berechnungen**: Sofortige Berechnung der effektiven Steuersätze und eingesparten Steuern pro Konto
  - **Validierung**: Automatische Prüfung der Freistellungsaufträge (maximale Summe darf Sparerpauschbetrag nicht überschreiten)
  - **Empfehlungen**: Konkrete Vorschläge zur Optimierung der Freibetragsverteilung
  - **Ein-Klick-Anwendung**: Optimale Verteilung kann mit einem Klick übernommen werden
- **Einkommensteuer auf Renten** - Berücksichtigung der deutschen Rentenbesteuerung
- **Basiszins-Konfiguration** - Verwaltung der offiziellen Basiszinssätze der Deutschen Bundesbank
- **Bundesbank API Integration** - Automatischer Abruf aktueller Basiszinssätze über SDMX API
- **Validierung und Fallbacks** - Intelligente Validierung mit automatischen Fallback-Mechanismen

### Was-wäre-wenn Szenarien

- **Vordefinierte Finanzszenarien** - Lernszenarien zum Erkunden verschiedener Anlagestrategien
  - **10+ Szenarien** - Konservative, ausgewogene, wachstumsorientierte und spezielle Situationen
  - **Kategorisiert** - Szenarien nach Risikoprofil und Lebenssituation organisiert
  - **Vollständig konfiguriert** - Jedes Szenario enthält realistische Parameter (Sparrate, Rendite, Laufzeit, Steuern)
  - **Bildungsinhalte** - Lernpunkte, Risiken und Zielgruppen für jedes Szenario
  - **Ein-Klick Anwendung** - Szenarien können direkt auf die aktuelle Simulation angewendet werden
  - **Durchsuchbar** - Schnelles Finden relevanter Szenarien durch Suchfunktion
  - **Detaillierte Beschreibungen** - Umfassende Informationen zu jedem Szenario in einem übersichtlichen Modal

### Interaktive Tutorials

- **Schritt-für-Schritt Anleitungen** - Geführte Tutorials für neue Benutzer
  - **5 Haupt-Tutorials** - Welcome, Sparpläne, Steuern, Entnahme, Monte Carlo Analyse
  - **Fortschrittsverfolgung** - Automatische Speicherung des Lernfortschritts in localStorage
  - **Flexible Navigation** - Vor/Zurück-Navigation, Schritte überspringen, Tutorials jederzeit neu starten
  - **Visuelle Fortschrittsanzeige** - Fortschrittsbalken und Schritt-Indikatoren zeigen aktuelle Position
  - **Voraussetzungen-System** - Tutorials bauen logisch aufeinander auf
  - **Deutsche Sprache** - Alle Inhalte in verständlichem Deutsch mit praktischen Beispielen
  - **Kontextuelle Aktionen** - Hilfreiche Hinweise, welche Aktionen als nächstes durchzuführen sind
  - **Kategorisierung** - Tutorials nach Themen gruppiert (Erste Schritte, Sparpläne, Entnahme, Steuern, Erweitert)
  - **Zeitschätzungen** - Jedes Tutorial zeigt geschätzte Dauer (3-7 Minuten)
  - **Abschluss-Tracking** - Markierung abgeschlossener Tutorials mit Wiederholungsmöglichkeit
  - **shadcn/ui Design** - Moderne, barrierefreie Dialog-Komponenten

### Glossar-Integration

- **Interaktive Begriffserklärungen** - Kontextbezogene Tooltips für komplexe Finanzfachbegriffe
  - **15+ Fachbegriffe** - Umfassende Erklärungen deutscher Steuerbegriffe (Vorabpauschale, Günstigerprüfung, Teilfreistellung, etc.)
  - **Detaillierte Definitionen** - Kurz- und Langdefinitionen mit praktischen Beispielen
  - **Verknüpfte Begriffe** - Verwandte Begriffe werden automatisch verlinkt
  - **Überall verfügbar** - Tooltips in Konfigurationen und Simulationsausgaben
  - **Barrierearm** - Tastatur-navigierbar und screenreader-freundlich
  - **Moderne UI** - Integration mit shadcn/ui Design System

### Behavioral Finance Insights

- **Häufige Anlegerfehler verstehen und vermeiden** - Bildungskomponente über psychologische Fallen beim Investieren
  - **12 Behavioral Biases** - Umfassende Aufklärung über typische psychologische Fehler
    - **Emotionale Biases** - Verlustaversion, Dispositionseffekt, FOMO
    - **Kognitive Fehler** - Selbstüberschätzung, Anker-Effekt, Bestätigungsfehler, Verfügbarkeitsheuristik, Rückschaufehler, Home Bias, Kontrollillusion
    - **Soziale Einflüsse** - Herdentrieb
    - **Mentale Buchführung** - Fehlerhafte mentale Kategorisierung von Geld
  - **Deutsche Kontextualisierung** - Alle Beispiele mit deutschem Finanzmarkt (DAX, ETFs, deutsche Aktien)
  - **Praktische Vermeidungsstrategien** - Konkrete Tipps zur Vermeidung jedes Bias
  - **Suchfunktion** - Schnelles Finden relevanter Biases
  - **Kategorisierung** - Übersicht nach Emotional, Cognitive und Social
  - **Verwandte Biases** - Verknüpfungen zwischen zusammenhängenden psychologischen Effekten
  - **Detaillierte Erklärungen** - Jeder Bias mit Definition, deutschem Beispiel und Vermeidungsstrategie

### Finanzziele & Fortschrittsverfolgung

- **SMART-Goals Integration** - Setzen und verfolgen Sie messbare Finanzziele
  - **Zieltypen**: Altersvorsorge, Finanzielle Unabhängigkeit, Benutzerdefinierte Ziele
  - **Meilensteine**: Automatische Meilenstein-Erstellung (25%, 50%, 75% des Ziels)
  - **Fortschrittsanzeige**: Echtzeit-Tracking Ihres Fortschritts gegenüber definierten Zielen
  - **Intelligente Anpassungsempfehlungen** - Automatische Empfehlungen bei Zielabweichungen
    - **Regelbasierte Analyse** - Transparente mathematische Berechnungen ohne KI/ML
    - **Fünf Empfehlungstypen** - Sparrate erhöhen, Zeithorizont anpassen, Ziel anpassen, Rendite optimieren, Kosten reduzieren
    - **Severity-Level** - Farbcodierte Dringlichkeit (Niedrig, Mittel, Hoch, Kritisch)
    - **Actionable Steps** - Konkrete Handlungsschritte für jede Empfehlung
    - **Auswirkungs-Analyse** - Transparente Darstellung der erwarteten Effekte
    - **On-Track Bestätigung** - Positive Bestärkung bei guter Fortschrittsentwicklung
  - **KPI-Dashboard**: Prominente Anzeige der Zielverfolgung mit visuellen Fortschrittsbalken
    - **Visuelle Indikatoren**: Farbcodierte Fortschrittsbalken (Blau für in Bearbeitung, Grün für erreicht)
    - **Achievement-Badges**: Anzeige von "Erreicht"-Status bei vollständiger Zielerreichung
    - **Nächster Meilenstein**: Automatische Anzeige des nächsten zu erreichenden Meilensteins
    - **Verbleibender Betrag**: Anzeige des noch benötigten Betrags zur Zielerreichung
    - **Responsive Layout**: Adaptive Darstellung für Desktop (3 Spalten), Tablet (2 Spalten) und Mobile (1 Spalte)
    - **Automatische Integration**: Dashboard erscheint automatisch in den Simulationsergebnissen
- **Aktive Ziele**: Nur aktive Ziele werden im Dashboard angezeigt
- **Mehrere Ziele**: Gleichzeitiges Tracking mehrerer Finanzziele möglich
  - **Drei Zieltypen** - Altersvorsorge, Finanzielle Unabhängigkeit, Benutzerdefinierte Ziele
  - **Automatische Fortschrittsberechnung** - Echtzeit-Berechnung des Fortschritts basierend auf aktuellem Kapital
  - **Meilenstein-Tracking** - Automatische Meilensteine bei 25%, 50% und 75% des Ziels
  - **Visuelle Fortschrittsanzeige** - Intuitive Fortschrittsbalken und Prozentanzeigen
  - **Ziel-Status** - Aktivieren/Deaktivieren einzelner Ziele nach Bedarf
  - **Persistente Speicherung** - Ziele werden automatisch mit dem Profil gespeichert
  - **Nächster Meilenstein** - Hervorhebung des nächsten zu erreichenden Meilensteins

### Liquiditätsreserve / Notfallfonds-Planung

- **Cash-Reserve-Strategien für Notfälle** - Planen Sie Ihre finanzielle Notfallreserve nach deutschen Standards
  - **Beschäftigungsspezifische Empfehlungen** - Automatische Empfehlungen basierend auf Ihrer Situation
    - Angestellte: 3-6 Monate Ausgaben
    - Selbstständige: 6-12 Monate Ausgaben
    - Rentner: 1-3 Monate Ausgaben
  - **Drei Reserve-Strategien** - Wählen Sie zwischen konservativ, ausgewogen und aggressiv
    - **Konservativ** - Hohe Liquidität mit Schwerpunkt auf sofort verfügbaren Mitteln (Girokonto, Tagesgeld)
    - **Ausgewogen** - Mix aus sofort verfügbaren Mitteln und kurzfristigen Anlagen
    - **Aggressiv** - Minimale Liquidität, höherer Anteil in kurzfristigen Anlagen mit Renditepotenzial
  - **Echtzeit-Status-Tracking** - Fortschrittsanzeige mit visueller Darstellung
  - **Monatliche Ausgaben-Konfiguration** - Anpassbarer Slider für Ihre durchschnittlichen Lebenshaltungskosten
  - **Flexible Zielsetzung** - Frei wählbare Anzahl der abzudeckenden Monate (1-24)
  - **Investitions-Integration** - Option zum Ausschluss des Notfallfonds von risikobehafteten Anlagen
  - **Intelligente Empfehlungen** - Dynamische Anpassung der Empfehlung basierend auf Beschäftigungsstatus und Strategie

- **🎯 Retirement-Readiness Score** - Umfassende Bewertung Ihrer Rentenbereitschaft
  - **Gesamtscore (0-100%)** - Aussagekräftiger Score mit deutscher Bewertungsskala (Ausgezeichnet bis Verbesserungswürdig)
  - **Drei Hauptmetriken** - Gewichtete Bewertung von Kapitaldeckung (40%), Einkommensersatz (30%) und Nachhaltigkeit (30%)
  - **Kapitaldeckung** - Verhältnis zwischen vorhandenem Kapital und idealem Betrag nach der 4%-Regel
  - **Einkommensersatz** - Bewertung, wie gut die monatliche Entnahme den Lebensstandard sichert
  - **Nachhaltigkeit** - Analyse, wie lange das Kapital voraussichtlich reichen wird
  - **Detaillierte Kennzahlen** - Übersicht über Gesamtkapital, monatliches Einkommen, jährliche Ausgaben und Restkapital
  - **Personalisierte Empfehlungen** - Konkrete Handlungsempfehlungen basierend auf den einzelnen Metriken
  - **Methodentransparenz** - Klare Erklärung der Berechnungsgrundlage und verwendeten Standards

### Unterhaltszahlungen

- **Kindesunterhalt, Ehegattenunterhalt und Trennungsunterhalt** - Integrierte Planung von Unterhaltszahlungen mit deutscher Steuerbehandlung
  - **Drei Unterhaltszahl-Typen** - Kindesunterhalt, Nachehelicher Unterhalt, Trennungsunterhalt
    - **Kindesunterhalt** - Nicht steuerlich absetzbar
    - **Nachehelicher Unterhalt** - Absetzbar als Sonderausgaben (Realsplitting gem. §10 Abs. 1a Nr. 1 EStG)
    - **Trennungsunterhalt** - Absetzbar als außergewöhnliche Belastungen (§33a EStG)
  - **Steuerliche Behandlung nach deutschem Recht**
    - **Realsplitting** - Bis zu 13.805€ jährlich als Sonderausgaben absetzbar (bei Vereinbarung)
    - **Außergewöhnliche Belastungen** - Bis zu 10.908€ pro Empfänger absetzbar
    - **Automatische Berechnung** - Steuerentlastung wird bei den Simulationen berücksichtigt
  - **Flexible Konfiguration**
    - **Mehrere Zahlungen** - Unbegrenzte Anzahl von Unterhaltszahlungen gleichzeitig
    - **Zeitraum-Steuerung** - Startjahr und optionales Endjahr für jede Zahlung
    - **Zahlungsfrequenz** - Monatlich, vierteljährlich oder jährlich
    - **Empfänger-Verwaltung** - Mehrere Empfänger pro Zahlung möglich
  - **Intelligente Validierung** - Automatische Prüfung der Realsplitting-Voraussetzungen
  - **Informationshilfen** - Eingebaute Hilfestellungen zu steuerrechtlichen Aspekten

### Eigenheim vs. Miete Vergleich

- **Umfassender Kaufen-oder-Mieten-Rechner** - Detaillierte Analyse der finanziellen Auswirkungen von Eigenheim vs. Miete
  - **Eigenheim-Szenario** - Vollständige Kostenberechnung für Immobilienkauf
    - **Kaufpreis und Eigenkapital** - Flexible Konfiguration von Kaufpreis und Eigenkapitalanteil
    - **Finanzierungsberechnung** - Präzise Darlehenszinsen und Tilgungsrechnung mit Amortisation
    - **Nebenkosten** - Berücksichtigung von Grundsteuer, Instandhaltung, Versicherung und Hausgeld
    - **Wertsteigerung** - Konfigurierbare jährliche Immobilienwertsteigerung
    - **Kaufnebenkosten** - Integration von Notar, Grunderwerbsteuer und Maklergebühren
  - **Miet-Szenario** - Realistische Mietkostenberechnung
    - **Kaltmiete und Nebenkosten** - Separate Konfiguration von Grundmiete und Nebenkosten
    - **Mietpreisentwicklung** - Jährliche Mieterhöhung mit konfigurierbarer Rate
    - **Investitionsrechnung** - Automatische Berechnung alternativer Kapitalanlagen für gesparte Anzahlung
    - **Kostendifferenz-Investment** - Intelligente Berechnung der Investition von Kostendifferenzen
  - **Vergleichsanalyse** - Detaillierte finanzielle Gegenüberstellung
    - **Break-Even-Analyse** - Automatische Ermittlung des Zeitpunkts, ab dem Eigenheim rentabler wird
    - **Vermögensaufbau** - Gegenüberstellung von Eigenkapital vs. Miet-Vermögen über die Zeit
    - **Gesamtkostenvergleich** - Vollständige Analyse aller kumulierten Kosten
    - **30-Jahres-Simulation** - Flexibler Vergleichszeitraum von 5-40 Jahren
  - **Intelligente Empfehlungen** - Datenbasierte Entscheidungshilfe
    - **Finanzielle Vorteilhaftigkeit** - Klare Empfehlung basierend auf Vermögensaufbau
    - **Monatskostenvergleich** - Gegenüberstellung der monatlichen Belastung im ersten Jahr
    - **Persönliche Präferenzen** - Berücksichtigung nicht-finanzieller Faktoren in der Empfehlung
  - **Moderne Visualisierung** - Übersichtliche Darstellung mit shadcn/ui
    - **Zusammenfassungskarten** - Farbcodierte Cards für Eigenheim, Miete und Differenz
    - **Interaktive Konfiguration** - Echtzeit-Update der Ergebnisse bei Parameteränderungen
    - **Responsive Design** - Optimiert für Desktop und mobile Geräte

### Globale Planung (Einzelperson/Ehepaar)

- **Planungsmodus** - Zentrale Auswahl zwischen Individual- und Paarplanung
- **Geschlechtskonfiguration** - Geschlechtsspezifische Einstellungen für präzise Lebenserwartungsberechnung
- **Lebensende-Berechnung** - Flexible Konfiguration mit manueller oder automatischer Berechnung
  - **Manuelle Eingabe** - Direkte Jahreseingabe für das Lebensende
  - **Automatische Berechnung** - Automatische Berechnung basierend auf Geburtsjahr und Lebenserwartung (ohne manuelle Buttons)
  - **Geburtsjahr-Rechner** - Automatische Echtzeit-Berechnung der Lebenserwartung für Einzelpersonen und Paare
  - **Gemeinsame Lebenserwartung** - Automatische Joint Life Expectancy Berechnung für Paare nach aktuariellen Methoden
- **Deutsche Sterbetafeln** - Statistische Grundlagen vom Statistischen Bundesamt (2020-2022)
  - Automatische geschlechtsspezifische Auswahl
  - Unterstützung für Individual- und Paarplanung
  - Benutzerdefinierte Lebenserwartung möglich
- **🏥 Pflegekosten-Simulation** - Umfassende Planung für deutsche Pflegebedürftigkeit
  - **Deutsche Pflegegrade** - Alle 5 Pflegegrade (1-5) mit korrekten Pflegegeld-Leistungen nach aktueller Gesetzgebung
  - **Kosten-Nutzen-Rechnung** - Automatische Berechnung von Brutto-Pflegekosten, gesetzlichen Leistungen und Netto-Eigenanteil
  - **Inflationsanpassung** - Konfigurierbare Inflationsrate für realistische Langzeit-Pflegekostenplanung (0-10% p.a.)
  - **Private Pflegeversicherung** - Integration privater Pflegezusatzversicherungen mit monatlichen Leistungen
  - **Steuerliche Absetzbarkeit** - Berücksichtigung außergewöhnlicher Belastungen nach deutschem Steuerrecht
  - **Paar-Planung** - Separate Konfiguration für beide Partner mit individuellen Pflegegraden und Zeiträumen
  - **Echtzeit-Kostenvorschau** - Sofortige Berechnung der erwarteten Pflegekosten mit detaillierter Aufschlüsselung
  - **Flexible Pflegedauer** - Konfigurierbare Pflegedauer oder automatische Berechnung bis Lebensende

### Interaktive Visualisierung

- **📈 Interaktive Charts** - Moderne interaktive Diagramme für bessere Datenvisualisierung
  - **Area Charts** - Gestapelte Flächendiagramme zeigen Kapitalentwicklung über Zeit
  - **Interaktive Kontrollen** - Toggle für inflationsbereinigte Werte, Steuer-Anzeige, Detail-/Übersichts-Modus
  - **Enhanced Tooltips** - Detaillierte Informationen mit Gesamtrendite-Berechnung beim Hover
  - **Zoom & Brush** - Zeitraum-Auswahl im Detail-Modus für große Datensätze
  - **Responsive Design** - Optimiert für Desktop und mobile Geräte
  - **Real-Time Updates** - Charts aktualisieren sich automatisch bei Parameteränderungen
  - **Professional Styling** - Integration mit shadcn/ui Design System
- **🎬 Portfolio-Animation** - Zeitbasierte Animation der Portfolioentwicklung
  - **Jahr-für-Jahr Visualisierung** - Animierte Darstellung der jährlichen Kapitalentwicklung
  - **Playback-Steuerung** - Play/Pause, Schrittweise Navigation (vor/zurück), Reset-Funktion
  - **Interaktiver Timeline-Slider** - Direkte Auswahl und Navigation zu beliebigen Jahren
  - **Echtzeit-Metriken** - Anzeige von Startkapital, Endkapital, Zinsen, Einzahlungen, Rendite und Steuern für jedes Jahr
  - **Fortschrittsanzeige** - Visuelle Fortschrittsbalken zeigen Position in der Zeitlinie
  - **Responsive Metriken-Grid** - Optimierte Darstellung für Desktop (3 Spalten) und Mobile (2 Spalten)
  - **Konfigurierbare Geschwindigkeit** - Anpassbare Animationsgeschwindigkeit (Standard: 1 Sekunde pro Jahr)
  - **Bildungsfördernd** - Hilft Benutzern, die Auswirkungen von Einzahlungen, Renditen und Steuern Jahr für Jahr zu verstehen

### Auszahlungsphase

- **Standard-Strategien**: 4% Regel, 3% Regel, variable Entnahme-Strategien
- **Dynamische Entnahmestrategie** - Renditebasierte Anpassung der Entnahme
- **Drei-Eimer-Strategie** - Cash-Polster für negative Rendite-Phasen
- **RMD-ähnliche Entnahme** - Geschlechtsspezifische Entnahme basierend auf Lebenserwartung
- **Kapitalerhalt / Ewige Rente** - Strategie zum dauerhaften Erhalt des realen Kapitalwerts
- **Steueroptimierte Entnahme** - Automatische Optimierung zur Minimierung der Steuerlast
  - **Drei Optimierungsmodi**: Steuerminimierung, Netto-Maximierung oder ausgewogener Ansatz
  - **Freibetrag-Optimierung**: Intelligente Nutzung des Sparerpauschbetrags (85% Zielnutzung)
  - **Deutsche Steuerregeln**: Integration von Vorabpauschale, Teilfreistellung und Basiszins
  - **Dynamische Anpassung**: Jährliche Neukalibrierung basierend auf Portfolioentwicklung
  - **Kapitalerhalt-Fokus**: Optimiert für langfristige Vermögenserhaltung mit Steuereffizienz
- **Monatliche Entnahme-Strategien** - Feste monatliche Entnahmen mit Inflationsanpassung und Anzeige realer Kaufkraft
- **Variable Renditen** - Jahr-für-Jahr konfigurierbare Renditen für die Entnahmephase
- **Geteilte Entnahme-Phasen** - Segmentierung in verschiedene Zeiträume mit unterschiedlichen Strategien
- **Strategienvergleich** - Vergleich verschiedener Entnahmestrategien mit demselben Startkapital
- **Gesetzliche Rente Integration** - Vollständige Integration der deutschen gesetzlichen Rente
  - **Konfiguration in der Entnahmephase**: Direkt im Variablen-Panel der Entnahmephase konfigurierbar
  - **Einzel- und Paarplanung**: Separate Rentenkonfiguration für Einzelpersonen oder Paare mit individuellen Rentenbeginn-Zeitpunkten
  - **Interaktiver Rentenpunkte-Rechner**: Berechnung der erworbenen Rentenpunkte basierend auf Bruttogehalt und Beitragsjahren
    - **Zwei Eingabemodi**: Schnell-Konfiguration für einfache Prognosen oder manuelle Jahr-für-Jahr Eingabe
    - **Schnell-Konfiguration**: Startjahr, Endjahr, Anfangsgehalt und jährliche Steigerung eingeben
    - **Manuelle Eingabe**: Individuelle Gehälter für jedes Jahr einzeln erfassen
    - Automatische Berechnung: (Ihr Gehalt) / (Durchschnittsgehalt) = Rentenpunkte pro Jahr
    - **Gehaltshistorie mit Durchschnittsvergleich**: Anzeige des Durchschnittsgehalts für jedes Jahr
    - Gehaltshistorie: Manuelle oder automatische Projektion der Gehaltsentwicklung
    - Regionsunterscheidung: Separate Berechnung für Ost- und Westdeutschland
    - Zukunftsprognose: Schätzung zukünftiger Durchschnittsgehälter mit konfigurierbarem Wachstum
    - **Detaillierte Ergebnisanzeige**: Beitragsjahre, Gesamtrentenpunkte, monatliche und jährliche Rente
    - **Ein-Klick-Übernahme**: Berechnete monatliche Rente direkt in die Konfiguration übernehmen
    - Monatliche Rente: Automatische Berechnung aus Rentenpunkten × aktueller Rentenwert (≈37,60€ in 2024)
    - **Informationskarte**: Integrierte Erklärung der Berechnung für besseres Verständnis
- **EM-Rente (Erwerbsminderungsrente) Berechnungen** - Umfassende Kalkulation der gesetzlichen Erwerbsminderungsrente
  - **Rentenarten**: Volle EM-Rente (unter 3 Std./Tag arbeitsfähig) und teilweise EM-Rente (3-6 Std./Tag arbeitsfähig)
  - **Zurechnungszeiten**: Automatische Berechnung der Zurechnungszeiten bis zum 67. Lebensjahr
    - Fiktive Beitragszeiten werden hinzugerechnet, als hätte die Person bis zum regulären Rentenalter gearbeitet
    - Berechnung basierend auf durchschnittlichen Rentenpunkten der Beitragszeit
  - **Abschlagsberechnung**: Korrekte Anwendung der Rentenabschläge für vorzeitigen Rentenbeginn
    - 0,3% Abschlag pro Monat vor dem regulären Rentenalter
    - Maximaler Abschlag: 10,8% (entspricht 36 Monaten)
  - **Hinzuverdienstgrenzen**: Automatische Berechnung der zulässigen Hinzuverdienstgrenzen
    - Volle EM-Rente: Hinzuverdienstgrenze basierend auf Formel (0,81 × Durchschnittsverdienst × 14) / 12
    - Teilweise EM-Rente: Etwa doppelte Hinzuverdienstgrenze der vollen EM-Rente
    - Automatische Rentenkürzung bei Überschreitung (40% des Überschreitungsbetrags)
  - **Steuerberechnung**: Korrekte Besteuerung nach deutschem Einkommensteuerrecht
    - Konfigurierbare Besteuerung (typisch 80% steuerpflichtiger Anteil)
    - Berücksichtigung des Grundfreibetrags
  - **Rentenwert-Integration**: Verwendung der aktuellen Rentenwerte (West/Ost ab 2024 identisch: 37,60 €)
  - **Jährliche Rentenanpassungen**: Konfigurierbare jährliche Rentensteigerungen (Standard: 1%)
  - **Pension Points Estimation**: Rückrechnung von Rentenpunkten aus erwarteter Rentenhöhe
  - **Rentenlücken-Analyse** - Umfassende Analyse der Differenz zwischen gewünschtem Lebensstandard und verfügbarem Ruhestandseinkommen
    - **Visualisierung der Einkommensquellen**: Grafische Darstellung von gesetzlicher Rente, Portfolio-Entnahmen und anderen Einkünften als Prozentsatz des gewünschten Einkommens
    - **Detaillierte Zusammenfassung**: Übersicht über Jahre mit voller Deckung vs. Jahre mit Rentenlücke
    - **Durchschnittliche Deckungsraten**: Berechnung der durchschnittlichen Rentendeckung und Portfolio-Entnahme-Rate
    - **Lückenidentifikation**: Identifikation der größten Rentenlücke mit Jahr und Betrag
    - **Jahr-für-Jahr Aufschlüsselung**: Detaillierte Analyse für jedes Jahr mit:
      - Gewünschtes vs. verfügbares Einkommen
      - Prozentualer Anteil jeder Einkommensquelle
      - Gesetzliche Rente, Portfolio-Entnahmen, andere Einkünfte und Krankenversicherungskosten
      - Status (vollständig gedeckt oder Rentenlücke mit Betrag)
    - **Inflationsberücksichtigung**: Automatische Anpassung des gewünschten Einkommens an die Inflation
    - **Intuitive Farbcodierung**: Grün für Rente, Blau für Portfolio, Lila für andere Einkünfte, Rot für Lücken
    - **Konfigurierbare Anzeige**: Optionale detaillierte Aufschlüsselung mit konfigurierbarer Anzahl angezeigter Jahre
- **Kranken- und Pflegeversicherung** - Umfassende Berücksichtigung von Kranken- und Pflegeversicherungsbeiträgen
  - **Einzelplanung**: Individuelle Krankenversicherung mit konfigurierbaren Beitragssätzen und Beitragsbemessungsgrenzen
  - **Paarplanung**: Optimierung für Paare mit automatischer Familienversicherung
    - **Familienversicherung**: Automatische Prüfung der Familienversicherung (505€/Monat, 538€ bei Mini-Jobs für 2025)
    - **Strategieoptimierung**: Automatische Wahl zwischen Einzelversicherung, Familienversicherung oder Optimierung
    - **Einkommensaufteilung**: Konfigurierbare Aufteilung von Entnahmebetrag und anderen Einkünften zwischen den Partnern
    - **Kostenvergleich**: Echtzeit-Vergleich verschiedener Versicherungsstrategien mit Einsparungsberechnung
  - **Versicherungsarten**: Gesetzliche und private Krankenversicherung mit unterschiedlichen Beitragssystemen
  - **Lebensphasen**: Unterscheidung zwischen Vorrente und Rente mit angepassten Beitragssätzen
  - **Zusatzbeiträge**: Kinderloser-Zuschlag (0,6%) individuell konfigurierbar pro Person
- **Andere Einkünfte** - Zusätzliche Einkommensquellen während der Entnahmephase
  - **Kindergeld-Integration** - Automatische Berücksichtigung deutschen Kindergelds
    - **Altersbasierte Berechnung**: Kindergeld endet automatisch mit dem 18. Geburtstag (oder 25 bei Ausbildung)
    - **Steuerfrei**: Kindergeld ist steuerfrei und wird nicht auf das Einkommen angerechnet
    - **Aktuelle Beträge**: 250€/Monat pro Kind (Stand 2024)
    - **Mehrere Kinder**: Separate Konfiguration für jedes Kind mit individuellem Geburtsjahr
    - **Ausbildungsberücksichtigung**: Option zur Verlängerung bis zum 25. Geburtstag bei Ausbildung/Studium
  - **Elterngeld** - Deutsche Elterngeld-Planung nach BEEG (Bundeselterngeld- und Elternzeitgesetz)
    - **Basiselterngeld**: 65-67% des vorherigen Nettoeinkommens (Minimum 300€, Maximum 1.800€/Monat)
    - **Einkommensabhängige Berechnung**: Automatische Berechnung der Ersatzrate (67% bis 1.200€, 65% ab 1.240€)
    - **ElterngeldPlus**: Halber Betrag bei doppelter Bezugsdauer (max. 24-28 Monate statt 12-14 Monate)
    - **Partnerschaftsbonus**: Zusätzliche 2-4 Monate bei paralleler Teilzeitarbeit beider Eltern
    - **Steuerfrei mit Progressionsvorbehalt**: Elterngeld ist steuerfrei, unterliegt aber dem Progressionsvorbehalt
    - **Flexible Konfiguration**: Vorheriges Einkommen, Bezugsdauer, Geburtsjahr/-monat des Kindes individuell einstellbar
    - **Realistische Planung**: Ermöglicht präzise Finanzplanung während der Elternzeit
  - **BU-Renten-Integration** - Umfassende Berücksichtigung von Berufsunfähigkeitsrenten
    - **Leibrenten-Besteuerung**: Korrekte steuerliche Behandlung nach § 22 EStG mit altersabhängigem Ertragsanteil
    - **Flexible Zeiträume**: Konfigurierbare Start- und Endjahre für Berufsunfähigkeitsphasen
    - **Automatische Steuerberechnung**: Nur der Ertragsanteil wird besteuert, Rest ist steuerfrei
    - **Altersabhängige Besteuerung**: Ertragsanteil variiert je nach Alter bei Beginn der Berufsunfähigkeit (z.B. 36% bei 40 Jahren)
    - **Dokumentation des BU-Grads**: Erfassung des Berufsunfähigkeitsgrades (0-100%) für Übersichtszwecke
    - **Dauerhafte oder temporäre BU**: Unterstützung sowohl für permanente als auch zeitlich begrenzte Berufsunfähigkeit
  - **Risikolebensversicherung** - Konfiguration von Term Life Insurance für Hinterbliebenenschutz
    - **Reiner Todesfallschutz**: Absicherung ohne Sparanteil für maximale Effizienz
    - **Steuerfreie Leistungen**: Todesfallleistungen sind steuerfrei nach § 20 Abs. 1 Nr. 6 EStG
    - **Flexible Konfiguration**: Deckungssumme, Laufzeit und Versicherungsbeginn individuell anpassbar
    - **Risikobasierte Prämienkalkulation**: Berücksichtigung von Alter, Geschlecht, Gesundheitszustand und Raucherstatus
    - **Zwei Deckungsarten**: Konstante Deckungssumme (level) oder fallende Deckung (decreasing)
    - **Familienplanung**: Separate Konfiguration für Einzelpersonen und Hinweis für Ehepaare
    - **Automatische Geburtsjahr-Integration**: Synchronisation mit Globaler Planung für konsistente Berechnungen
  - **Kapitallebensversicherung** - Vollständige Integration klassischer Lebensversicherungsprodukte mit deutscher Steuergesetzgebung
    - **Einmalauszahlung bei Fälligkeit**: Konfigurierbare Auszahlungsbeträge und Zeitpunkte
    - **Halbeinkünfteverfahren**: Unterstützung für ältere Verträge mit 50% Steuerbefreiung der Erträge
    - **12-Jahres-Steuerfreiheit**: Automatische Prüfung der Steuerfreiheit nach § 20 Abs. 1 Nr. 6 EStG
      - Vollständige Steuerbefreiung bei 12+ Jahren Laufzeit und Auszahlung ab Alter 60
      - Altersabhängige Prüfung basierend auf Geburtsjahr des Versicherten
    - **Ertragsberechnung**: Automatische Berechnung der Kapitalerträge (Auszahlung - gezahlte Beiträge)
    - **Abgeltungsteuer**: Korrekte Anwendung der Kapitalertragsteuer (26,375%) auf steuerpflichtige Erträge
    - **Echtzeit-Steuervorschau**: Interaktive Anzeige von Vertragslaufzeit, Alter bei Auszahlung und steuerlicher Behandlung
    - **Flexible Konfiguration**: Individuelle Anpassung von Vertragsbeginn, Fälligkeit, Auszahlungsbetrag und gezahlten Beiträgen
  - **Fondsgebundene Lebensversicherung (Calculation Library)** - Umfassende Berechnungsfunktionen für ETF-Sparpläne in Versicherungsmänteln
    - **Jahr-für-Jahr Simulation**: Vollständige Portfolioentwicklung mit Beiträgen, Renditen und Kosten
    - **Kostenmodellierung**: Abschlusskosten (Zillmerung über 5 Jahre), Verwaltungskosten, Garantiekosten, Sterblichkeitskosten
    - **Steuervorteile**: Halbeinkünfteverfahren nach 12 Jahren Laufzeit + Alter 62 (nur 50% der Gewinne steuerpflichtig)
    - **Garantieoptionen**: Konfigurierbare Mindestgarantien bei Fälligkeit
    - **Todesfallschutz**: Altersabhängige Sterblichkeitskosten und konfigurierbare Todesfallleistung
    - **Vergleichsrechnung**: Direkter Vergleich mit ETF-Direktanlage zur Bewertung des Versicherungsmantels
    - **Effektivrendite-Berechnung**: Automatische Berechnung der Nettorendite nach allen Kosten
    - **Kostenquote**: Transparente Darstellung des Kostenanteils an den Gesamtbeiträgen
    - **Flexible Konfiguration**: Individuelle Anpassung von Beiträgen, Renditen, Kosten, Garantien und Laufzeiten
    - **Umfassende Tests**: 24 Testszenarien sichern Berechnungskorrektheit und Zuverlässigkeit
  - **Pflegezusatzversicherung** - Umfassende Pflegeversicherungs-Integration für Altersvorsorgeplanung
    - **Pflegegrad-System**: Vollständige Unterstützung der deutschen Pflegegrade 1-5 mit detaillierten Beschreibungen
      - Pflegegrad 1: Geringe Beeinträchtigung der Selbstständigkeit
      - Pflegegrad 2: Erhebliche Beeinträchtigung der Selbstständigkeit
      - Pflegegrad 3: Schwere Beeinträchtigung der Selbstständigkeit
      - Pflegegrad 4: Schwerste Beeinträchtigung der Selbstständigkeit
      - Pflegegrad 5: Schwerste Beeinträchtigung mit besonderen Anforderungen
    - **Steuerfreie Leistungen**: Pflegeleistungen sind steuerfrei nach § 3 Nr. 1a EStG
    - **Beitragsabsetzbarkeit**: Steuerliche Absetzbarkeit der Versicherungsbeiträge nach § 10 Abs. 1 Nr. 3 EStG
      - Konfigurierbare maximale jährliche Absetzbarkeit (Standard: 1.900€)
      - Automatische Berechnung des Steuervorteils durch Beitragsabzug
    - **Flexible Pflegezeiträume**: Konfigurierbare Start- und Endjahre für Pflegebedürftigkeit
    - **Dauerhafte oder temporäre Pflege**: Unterstützung sowohl für lebenslange als auch zeitlich begrenzte Pflegebedürftigkeit
    - **Netto-Nutzen-Berechnung**: Automatische Berechnung von Leistungen minus Beiträge plus Steuervorteile
    - **Altersbasierte Planung**: Berücksichtigung des Alters bei Pflegebeginn für realistische Szenarien
    - **Echtzeit-Übersicht**: Interaktive Anzeige von monatlichen/jährlichen Leistungen, Beiträgen und Netto-Nutzen
  - **Kinder-Bildungskosten** - Umfassende Finanzplanung für Ausbildungskosten von Kindern
    - **Bildungsphasen-System**: Automatische Abbildung deutscher Bildungswege
      - Kita/Kindergarten (ca. 1-6 Jahre)
      - Grundschule (ca. 6-10 Jahre)
      - Weiterführende Schule (ca. 10-19 Jahre)
      - Berufsausbildung (ca. 16-19 Jahre)
      - Studium/Universität (ca. 19-25 Jahre)
    - **Zwei Standardbildungswege**: Regelweg (Studium) und Berufsausbildung mit vorkonfigurierten Phasen
    - **Realistische Kostenschätzungen**: Durchschnittliche monatliche Kosten basierend auf deutschen Verhältnissen
      - Kita: 300€/Monat, Grundschule: 50€/Monat, Weiterführend: 100€/Monat
      - Ausbildung: 150€/Monat, Studium: 850€/Monat
    - **BAföG-Integration**: Vollständige Berücksichtigung deutscher Studienförderung
      - Automatische Berechnung der BAföG-Berechtigung basierend auf Elterneinkommen
      - Unterscheidung zwischen Wohnen bei Eltern (max. 633€) und eigenem Haushalt (max. 934€)
      - 50% Zuschuss, 50% zinsloses Darlehen gemäß BAföG-Regelungen 2024
      - Einkommensabhängige Berechnung mit konfigurierbarem Elterneinkommen
    - **Inflationsanpassung**: Automatische Anpassung der Bildungskosten über die Zeit (Standard: 2% p.a.)
    - **Steuerliche Absetzbarkeit**: Berufsausbildung und Studium als Sonderausgaben (max. 6.000€ p.a. nach § 10 Abs. 1 Nr. 7 EStG)
    - **Altersbasierte Berechnung**: Automatische Zuordnung zu Bildungsphasen basierend auf Geburtsjahr
    - **Geschätzte Gesamtkosten**: Echtzeit-Berechnung der erwarteten Gesamtkosten über alle Bildungsphasen
    - **Netto-Kosten-Berechnung**: Bildungskosten minus BAföG-Unterstützung für realistische Finanzplanung
  - **Immobilien-Cashflow Integration** - Umfassende Immobilienertragsberechnung mit deutschen Steuerregeln
    - **Realistische Kostenfaktoren**: Instandhaltungskosten (0-30%), Leerstandsquote (0-20%), Finanzierungskosten
    - **Wertsteigerungsberechnung**: Optionale Berücksichtigung der Immobilienwertsteigerung als zusätzliches Einkommen
    - **Deutsche Immobiliensteuer**: Vollständige Integration der steuerlichen Behandlung von Mieteinnahmen
    - **Inflationsanpassung**: Automatische Mietanpassungen über die Entnahmephase
  - **Weitere Einkommensarten**: Private Renten, Gewerbeeinkünfte, Kapitalerträge, sonstige Einkünfte
  - **Brutto-/Netto-Konfiguration**: Flexible Eingabe mit automatischer Steuerberechnung
  - **Zeitraum-Flexibilität**: Konfigurierbare Start- und Endjahre für zeitlich begrenzte Einkünfte
- **Immobilien-Teilverkauf mit Nießbrauchrecht** - Alternative Liquiditätsgenerierung im Ruhestand
  - **Teilverkauf-Simulation**: Verkauf von 20-50% der Immobilie bei lebenslangem Wohnrecht
  - **Nießbrauch-Kalkulation**: Berechnung der jährlichen Nießbrauchgebühr für das Wohnrecht
  - **Liquiditätsgewinn**: Sofortige Verfügbarkeit von Kapital ohne vollständigen Immobilienverkauf
  - **Strategievergleich**: Automatischer Vergleich mit drei Alternativen
    - **Teilverkauf**: Teilweiser Verkauf mit Nießbrauchrecht und Gebühren
    - **Vollverkauf + Miete**: Kompletter Verkauf mit anschließender Mietzahlung
    - **Leibrente**: Traditionelle Leibrente ohne Verkauf
  - **Kostenberechnung**: Transparente Darstellung von Transaktionskosten, Nießbrauchgebühren und Mietkosten
  - **Vermögensvergleich**: Vergleich des Endvermögens aller drei Strategien
  - **Empfehlungssystem**: Automatische Empfehlung der optimalen Strategie basierend auf Endvermögen
  - **Deutsche Steuerregeln**: Berücksichtigung von Grunderwerbsteuer und Notarkosten
  - **Flexible Konfiguration**: Immobilienwert, Verkaufsanteil, Alter bei Verkauf, Wertsteigerung individuell einstellbar
  - **Realistische Szenarien**: Konfigurierbare Mietsteigerung, Anlagerendite und Leibrenten-Zahlungen für Vergleich

### Analyse und Simulation

- **Finanzübersicht** - Kompakte Übersicht aller wichtigen Kennzahlen mit Sticky Navigation
- **Strategievergleich** - Umfassende Vergleichsmöglichkeiten für Entnahmestrategien
- **Historisches Backtesting** - Test mit 24 Jahren Marktdaten (DAX, S&P 500, MSCI World)
- **Monte Carlo Analyse** - Statistische Auswertung verschiedener Rendite-Szenarien
- **Sensitivitätsanalyse** - Analyse der Auswirkungen von Parameteränderungen
  - **Parameter-Ranking** - Automatische Bewertung der einflussreichsten Faktoren
  - **Interaktive Visualisierung** - Grafische Darstellung der Auswirkungen einzelner Parameter
  - **Szenario-Vergleich** - Vergleich von niedrigsten, höchsten und Basis-Szenarien
  - **Handlungsempfehlungen** - Praktische Tipps zur Optimierung der Finanzplanung
  - **5 Parameter-Analysen** - Rendite, Sparrate, Steuerlast, Inflationsrate, Anlagedauer
- **Black Swan Ereignisse** - Simulation extremer Markteinbrüche für Portfolio-Stresstests
  - **Historische Krisen** - Dotcom-Blase (2000-2003), Finanzkrise (2008-2009), COVID-19 Pandemie (2020)
  - **Detaillierte Ereignisprofile** - Jahr-für-Jahr Renditen basierend auf historischen Daten
  - **Kumulativer Verlust** - Automatische Berechnung des Gesamtverlusts über die Krisendauer
  - **Flexible Zeitplanung** - Wählbares Jahr für Krisensimulation innerhalb des Anlagezeitraums
  - **Erholungszeit-Anzeige** - Historische Daten zur durchschnittlichen Markterholung
  - **Widerstandsfähigkeitstest** - Bewertung der Portfolio-Robustheit in Extremszenarien
- **Stress-Testing** - Systematische Tests extremer Szenarien zur Portfolio-Resilienz-Bewertung
  - **Historische Krisenszenarien** - Automatische Simulation von Dotcom-Crash (2000-2003), Finanzkrise (2008-2009) und COVID-19 (2020)
  - **Systematische Vergleiche** - Parallel-Testing aller Krisenszenarien für umfassende Risikobewertung
  - **Portfolio-Resilienz-Metriken** - Schlimmstes Szenario, durchschnittlicher Verlust, durchschnittliche Erholungszeit
  - **Verlust-Berechnung** - Absoluter und prozentualer Kapitalverlust gegenüber Baseline ohne Krise
  - **Erholungszeit-Analyse** - Berechnung der benötigten Jahre zur Wiederherstellung des Baseline-Kapitals
  - **Detaillierte Ergebnistabelle** - Übersicht aller Szenarien mit Verlust, Erholungszeit und Endkapital
  - **Risiko-Visualisierung** - Farbcodierte Darstellung der Krisenschwere (gelb/orange/rot)
- **Inflationsszenarien** - Simulation verschiedener Inflationsentwicklungen für realistische Altersvorsorge-Planung
  - **Realistische Szenarien (für Altersvorsorge)**:
    - **Optimistisch (1,5% p.a.)** - Niedrige Inflation unter dem EZB-Ziel für konservative Planungen
    - **Moderat (2,0% p.a.)** - Stabile Inflation am EZB-Ziel als Baseline-Szenario
    - **Pessimistisch (3,5% p.a.)** - Anhaltend erhöhte Inflation über dem EZB-Ziel
    - **Historisch (2000-2023)** - Basierend auf tatsächlichen deutschen Inflationsraten (Durchschnitt ~1,7%)
  - **Stress-Test Szenarien (für Krisenplanung)**:
    - **Hyperinflation (8-12% p.a.)** - Extreme Inflation ähnlich der 1970er Jahre
    - **Deflation (-2% bis 0%)** - Fallende Preise ähnlich Japan in den 1990er Jahren
    - **Stagflation (6-8%)** - Kombination aus hoher Inflation und reduzierten Renditen
  - **Kaufkraftverlust-Berechnung** - Automatische Berechnung des realen Kaufkraftverlusts über die Szenariodauer
  - **Kumulative Inflation** - Gesamtinflation und durchschnittliche jährliche Inflationsrate
  - **Rendite-Anpassungen** - Bei Stagflation werden Renditen automatisch reduziert
  - **Flexible Zeitplanung** - Wählbares Startjahr für Inflationsszenario innerhalb des Anlagezeitraums
  - **Kategorisierte Darstellung** - Übersichtliche Gruppierung in "Realistische Szenarien" und "Stress-Test Szenarien"
  - **Kombinierbar mit variablen Renditen** - Integration in bestehende Variable-Renditen-Konfiguration
- **Erweiterte Risikobewertung** - Value-at-Risk (5% & 1% VaR), Maximum Drawdown, Sharpe Ratio, Sortino Ratio, Calmar Ratio
  - **Stress-Test-Analyse** - Systematische Tests mit extremen Marktszenarien für Portfolio-Resilienz
    - **Historische Krisenszenarien** - Finanzkrise 2008 (-57%), COVID-19 Crash (-34%), Dotcom-Blase (-49%), Schwarzer Montag 1987 (-23%), Europäische Schuldenkrise (-37%)
    - **Hypothetische Szenarien** - Leichte Korrektur (-10%), Moderater Crash (-20%), Schwerer Crash (-40%), Extremer Crash (-60%)
    - **Worst-Case-Identifikation** - Automatische Identifikation des schlimmsten Szenarios mit detaillierter Erklärung
    - **Durchschnittsverlust-Berechnung** - Durchschnittlicher Verlust über alle getesteten Szenarien
    - **Restwert-Berechnung** - Portfolio-Wert nach Anwendung jedes Stress-Szenarios
    - **Historische Referenzen** - Detaillierte Informationen zu historischen Markteinbrüchen und deren Zeiträumen
    - **Mobile-Responsive Design** - Optimierte Darstellung auf mobilen Geräten und Desktop
- **Risiko-Zeitreihen** - Detaillierte Drawdown- und Rendite-Serien für tiefere Analyse
- **Detaillierte Simulation** - Jahr-für-Jahr Aufschlüsselung mit Vorabpauschale-Berechnungen
- **Berechnungsaufschlüsselung** - Interaktive Erklärungen für Steuer- und Zinsberechnungen
- **Daten Export** - CSV Export, Excel Export (mit Formeln), PDF Export (professionelle Berichte), Markdown Export, Parameter Export für alle Simulationsdaten (inkl. Sonderereignisse)
- **Profilverwaltung** - Umfassende Verwaltung mehrerer Konfigurationsprofile
  - **Profile erstellen** - Neue Profile für verschiedene Familien oder Testszenarien
  - **Profilwechsel** - Nahtloser Wechsel zwischen verschiedenen Konfigurationen mit einem Klick
  - **Automatisches Speichern** - Alle Änderungen werden automatisch im aktiven Profil gespeichert
  - **Profil-Aktionen** - Bearbeiten, Duplizieren und Löschen von Profilen
  - **Rückwärtskompatibilität** - Automatische Migration von Legacy-Konfigurationen
  - **Aktiver Profil-Status** - Klare Anzeige des aktuell aktiven Profils mit Zeitstempel
- Echtzeit-Updates bei Parameteränderungen

---

## Entwicklung

### State Management

Das Projekt verwendet ein zentralisiertes State Management mit React Context API:

#### SimulationContext

- **Zentrale Zustandsverwaltung**: Alle Simulationsparameter, Steuereinstellungen, und Berechnungsergebnisse werden im `SimulationContext` verwaltet
- **Custom Hook `useSimulation()`**: Zugriff auf den globalen State ohne Prop Drilling
- **52+ Komponenten**: Über 52 Komponenten nutzen bereits den Context direkt
- **Reduziertes Prop Drilling**: HomePage-Hierarchie wurde optimiert - von 20+ Props auf 1-2 Props pro Ebene reduziert

#### Spezialisierte Hooks

- **`useHomePageLogic`**: Aggregiert Logik und Handler für die HomePage
- **`useAnalysisConfig`**: Stellt Konfigurationen für Sensitivitätsanalyse bereit
- **`useReturnConfiguration`**: Verwaltet Rendite-Konfigurationen
- **Weitere Custom Hooks**: Über 80 spezialisierte Hooks für verschiedene Features (Entnahme, Gesundheitsversicherung, Renten, etc.)

#### Vorteile

- **Wartbarkeit**: Geringere Kopplung zwischen Komponenten
- **Wiederverwendbarkeit**: Logik in Custom Hooks gekapselt
- **Testbarkeit**: Hooks und Komponenten können isoliert getestet werden
- **Performance**: Optimiert für schnelles Laden und effiziente Updates
  - **Lazy Loading**: Große Komponenten werden erst bei Bedarf geladen (DataExport, SimulationModeSelector, ProfileManagement, etc.)
  - **Code-Splitting**: Automatische Aufteilung in separate Chunks (React-Vendor, UI-Komponenten, Charts, Forms)
  - **Bundle-Optimierung**: Hauptbundle von 1,4 MB auf 220 KB reduziert (84% Reduktion)
  - **React.memo**: Häufig re-rendernde Komponenten werden nur bei Prop-Änderungen neu gerendert
  - **useMemo/useCallback**: Teure Berechnungen werden gecached und nur bei Bedarf neu ausgeführt
  - **Suspense Fallbacks**: Nutzerfreundliche Ladezustände während des Komponentenladens

### Code-Qualitätsstandards

Das Projekt verwendet umfassende Code-Qualitätsprüfungen, die mit Codacy-Standards kompatibel sind:

#### ESLint-Regeln

- **Code-Komplexität**: Warnungen bei zyklomatischer Komplexität über 15 (Phase 4.2 - Ziel: 8 für neuen Code)
- **Verschachtelungstiefe**: Maximale Verschachtelungstiefe von 5 Ebenen
- **Funktionsgröße**: Warnungen bei Funktionen über 200 Zeilen (Phase 4.2 - Ziel: 50 für neuen Code)
- **Sicherheit**: Strenge Regeln gegen `eval`, `new Function`, etc.
- **Best Practices**: Durchsetzung von `prefer-const`, `eqeqeq`, etc.
- **Kontinuierliche Verbesserung**: Siehe `REFACTORING.md` für den schrittweisen Refactoring-Plan

#### CI/CD Pipeline

Die GitHub Actions Workflows prüfen bei jedem Push und Pull Request:

1. **Build** - Vite Build-Prozess
2. **Lint** - ESLint mit erweiterten Codacy-kompatiblen Regeln (inkl. automatisches Markdown-Linting)
3. **Type Check** - TypeScript-Typenprüfung
4. **Test** - Vitest mit Coverage (1358+ Tests)

#### Verfügbare Scripts

```bash
npm install       # Abhängigkeiten installieren
npm run dev       # Entwicklungsserver starten
npm run build     # Produktions-Build erstellen
npm run lint      # ESLint + Markdown-Linting ausführen (0 Warnungen erlaubt)
npm run typecheck # TypeScript-Typen prüfen
npm run test      # Tests ausführen
npm run test:coverage # Tests mit Coverage
```

**Hinweis:** `npm run lint` führt automatisch auch Markdown-Linting durch (`postlint` Hook).

#### Code-Qualitätsziele

- **0 Fehler**: Keine ESLint-Fehler erlaubt
- **Warnungen**: Aktuell 54 Warnungen während Phase 4.2 (Progressive Verschärfung - Ziel: 0)
- **Test-Coverage**: Umfassende Test-Abdeckung mit 1523+ Tests
- **TypeScript-Strict**: Strikte TypeScript-Konfiguration aktiviert
- **Code-Refactoring**: Aktives Refactoring zur Verbesserung der Codequalität (siehe `REFACTORING.md`)

---

**Autor:** Marco
