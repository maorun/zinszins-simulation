# Zinseszins-Simulation - Potenzielle Features

Diese Dokumentation listet potenzielle zukünftige Erweiterungen und explizit nicht umzusetzende Features für den deutschen Zinseszins-Rechner auf.

## 🎯 Bereits implementierte Features (Referenz)

Diese Features sind bereits vollständig im System implementiert und getestet:

### Finanzplanung & Steuerberechnung
- ✅ **Vorabpauschale mit Bundesbank-Integration** - Vollständige deutsche Investmentsteuerberechnung mit SDMX API
- ✅ **Günstigerprüfung** - Automatische Wahl zwischen Abgeltungssteuer und persönlichem Steuersatz
- ✅ **Kirchensteuer** - Bundeslandspezifische Kirchensteuerberechnung (8-9%)
- ✅ **Basiszins-Konfiguration** - Verwaltung historischer Basiszinssätze der Bundesbank
- ✅ **Planungsmodus-abhängiger Sparerpauschbetrag** - 2.000€ (Einzelperson) / 4.000€ (Ehepaar)
- ✅ **Teilfreistellung** - Korrekte Berechnung für verschiedene Fondstypen (Aktien, Misch, Immobilien)

### Portfolio & Asset Allocation
- ✅ **Multi-Asset Portfolio** - 7 Anlageklassen mit individueller Rendite/Volatilität-Konfiguration
- ✅ **Automatisches Rebalancing** - Konfigurierbare Frequenz und schwellenbasiertes Rebalancing
- ✅ **Korrelationsmatrix** - Historische Korrelationen zwischen Anlageklassen
- ✅ **Historisches Backtesting** - DAX, S&P 500, MSCI World (2000-2023)
- ✅ **Inflation** - Vollständige Inflationsberücksichtigung mit Real/Nominal-Anzeige

### Entnahmestrategien
- ✅ **9 Entnahmestrategien** - 4%, 3%, dynamisch, Bucket, RMD, Kapitalerhalt, steueroptimiert, monatlich fest, variabel
- ✅ **Steueroptimierte Entnahme** - Drei Modi: Steuerminimierung, Netto-Maximierung, ausgewogen
- ✅ **Segmentierte Entsparphase** - Verschiedene Strategien für verschiedene Lebensphasen
- ✅ **Strategienvergleich** - Umfassender Vergleich mehrerer Entnahmestrategien parallel
- ✅ **Geteilte Entnahme-Phasen** - Flexible Segmentierung mit unterschiedlichen Strategien pro Phase

### Lebensplanung
- ✅ **Lebenserwartungs-Berechnung** - Deutsche Sterbetafeln 2020-2022 mit Joint Life Expectancy
- ✅ **Pflegekosten-Simulation** - Alle 5 Pflegegrade mit korrekten gesetzlichen Leistungen
- ✅ **Gesetzliche Rente** - Vollständige Integration mit Rentenbesteuerung
- ✅ **Krankenversicherung für Paare** - Familienversicherungs-Optimierung mit Einkommensaufteilung
- ✅ **Erbschaftsteuer** - Vollständige deutsche ErbStG-Implementierung mit allen Steuerklassen

### Sonderereignisse
- ✅ **Erbschaften** - Mit deutscher Erbschaftsteuerberechnung nach Verwandtschaftsgrad
- ✅ **Ausgaben mit Kreditfinanzierung** - Kategoriebasierte Zinssätze und Ratenzahlungen
- ✅ **Black Swan Ereignisse** - Dotcom, Finanzkrise 2008, COVID-19 mit historischen Renditen

### Analyse & Visualisierung
- ✅ **Sensitivitätsanalyse** - 5 Parameter mit Ranking und Handlungsempfehlungen
- ✅ **Monte Carlo Simulation** - Statistische Auswertung mit Perzentilen
- ✅ **Erweiterte Risikometriken** - VaR, Maximum Drawdown, Sharpe, Sortino, Calmar Ratio
- ✅ **Interaktive Charts** - Area Charts mit Zoom, Brush, inflationsbereinigten Werten
- ✅ **Profilverwaltung** - Mehrere Konfigurationsprofile mit Auto-Save

### Datenmanagement
- ✅ **Umfassender Export** - CSV, Markdown, Parameter-Export für alle Simulationsdaten
- ✅ **Immobilien-Cashflow Integration** - Mieteinnahmen mit deutscher Steuerbehandlung
- ✅ **Andere Einkünfte** - Private Renten, Gewerbeeinkünfte, Kapitalerträge

## 🔮 Potenzielle zukünftige Features

### Erweiterte Finanzplanung

#### Steueroptimierung
- **Tax-Loss Harvesting Simulation** - Simulation von Verlustverrechnungsstrategien für Kursgewinne
  - Intelligente Verkaufsempfehlungen bei Verlusten zur Steuersenkung
  - Berücksichtigung der Einjahresfrist und Spekulationsgewinne
  - Optimierung über mehrjährige Zeiträume
- **Progressionsvorbehalt** - Auswirkungen auf andere Einkünfte bei ausländischen Einkünften
  - Simulation ausländischer Kapitaleinkünfte
  - Berechnung des Progressionsvorbehalts auf deutsche Einkünfte
  - Strategien zur Minimierung der Progression
- **Verlustverrechnungstöpfe** - Simulation verschiedener Verlustverrechnungsregeln
  - Separate Töpfe für Aktien, sonstige Einkünfte
  - Mehrjähriger Verlustvortrag mit 20.000€ Grenze
  - Optimierungsvorschläge für Verlustnutzung
- **Freistellungsaufträge-Optimierung** - Optimale Verteilung der Freibeträge auf verschiedene Banken
  - Automatische Berechnung optimaler Verteilung bei mehreren Depots
  - Berücksichtigung unterschiedlicher Renditen pro Depot
  - Visualisierung der Steuerersparnis durch Optimierung

#### Asset Allocation & Portfolio-Management
- **Erweiterte Rebalancing-Strategien** - Zusätzlich zu vorhandenem periodischem/schwellenbasiertem Rebalancing:
  - **Taktisches Rebalancing** - Marktbasierte Anpassungen der Allokation
  - **Volatility-Based Rebalancing** - Anpassung basierend auf Marktvolatilität
  - **Momentum-Rebalancing** - Übergewichtung von Gewinner-Assets
- **Faktor-Investing** - Integration von Value, Growth, Small-Cap, Momentum Faktoren
  - Faktor-Prämien für verschiedene Anlagestrategien
  - Multi-Faktor-Portfolios mit Kombination verschiedener Faktoren
  - Backtesting mit historischen Faktor-Renditen
- **Erweiterte geografische Diversifikation** - Zusätzlich zu vorhandenen Regionen:
  - Schwellenländer (Emerging Markets) als separate Anlageklasse
  - Frontier Markets für höhere Risikobereitschaft
  - Länderspezifische Quellensteuer-Berücksichtigung
- **ESG-Integration** - Nachhaltigkeitsfilter und ESG-Score-basierte Portfolios
  - ESG-Ratings für verschiedene Anlageklassen
  - Ausschluss-Kriterien für bestimmte Branchen
  - Rendite-Anpassungen für ESG-Portfolios
- **Kryptowährungen als Anlageklasse** - Bitcoin, Ethereum als Portfolio-Beimischung
  - Höhere Volatilitäts-Modellierung (80-100% p.a.)
  - Korrelation zu traditionellen Assets
  - Deutsche steuerliche Behandlung (1-Jahres-Haltefrist)
  - Risiko-Warnungen und Portfolio-Begrenzung (max. 5-10%)

#### Risikomanagement
- **Erweiterte Inflationsszenarien** - Zusätzlich zur vorhandenen Inflation:
  - **Hyperinflation** - Szenario mit 10-20% Inflation über mehrere Jahre
  - **Deflation** - Negatives Preiswachstum mit Auswirkungen auf Anlagen
  - **Stagflation** - Kombination aus Stagnation und Inflation
  - Historische Inflationsdaten für Deutschland (1950-heute)
- **Währungsrisiko-Management** - Multi-Währungs-Portfolios mit Wechselkursrisiken
  - USD, EUR, CHF, GBP Diversifikation
  - Historische Wechselkursschwankungen
  - Absicherungskosten (Hedging) berücksichtigen
- **Erweiterte Liquiditätsplanung** - Zusätzlich zu vorhandenen Entnahmestrategien:
  - **Notfall-Reserven** - Empfohlene Cash-Reserven nach Lebensphase
  - **Liquiditätskaskade** - Automatische Reihenfolge beim Vermögensabbau
  - **Kredit-Optionen** - Überbrückungskredite vs. Kapitalverzehr
- **Tail-Risk Hedging** - Absicherungsstrategien gegen extreme Verluste
  - Put-Optionen als Portfolio-Versicherung
  - Kosten der Absicherung vs. Nutzen
  - Alternative Absicherungsstrategien (Gold, Cash)
- **Longevity Risk** - Langlebigkeitsrisiko-Analyse
  - Was-wäre-wenn Szenarien bei Überleben der statistischen Lebenserwartung
  - Empfehlungen für Kapitalerhalt bei hoher Lebenserwartung
  - Sofortrenten als Alternative bei Langlebigkeitsrisiko

### Lebenssituationen & Planung

#### Familienplanung
- **Erweiterte Kinder-Finanzplanung** - Zusätzlich zu vorhandenen Sonderereignissen:
  - **Ausbildungskosten-Simulation** - Kita, Schule, Studium mit Inflationsanpassung
  - **BAföG-Integration** - Automatische Berechnung BAföG-Anspruch basierend auf Elterneinkommen
  - **Studiengebühren** - Private Hochschulen, Auslandsstudium
  - **Junior-Depot Simulation** - Separate Vermögensaufbau für Kinder
- **Kindergeld-Integration** - Automatische Berücksichtigung von Kindergeld über Zeit
  - Altersabhängige Kindergeldzahlungen (bis 18/25 Jahre)
  - Automatische Einstellung bei Volljährigkeit/Studienende
  - Integration in Andere Einkünfte
- **Elternzeit-Berücksichtigung** - Einkommensausfall und staatliche Unterstützung
  - Elterngeld-Berechnung basierend auf vorherigem Einkommen
  - Auswirkung auf Sparraten während Elternzeit
  - Rentenpunkte während Elternzeit
- **Generationenübergreifende Planung** - Erweitert vorhandene Erbschaftssteuer-Funktion:
  - **Schenkungen zu Lebzeiten** - 10-Jahres-Freibeträge nutzen
  - **Kettenschenkungen** - Optimierung über Generationen (Enkel)
  - **Nießbrauch-Regelungen** - Immobilien mit Nutzungsrecht übertragen
  - **Familienstiftungen** - Vermögenserhalt über Generationen
- **Unterhaltszahlungen** - Berücksichtigung von Alimente oder Kindesunterhalt
  - Düsseldorfer Tabelle Integration
  - Steuerliche Absetzbarkeit (Realsplitting)
  - Zeitliche Begrenzung bis Volljährigkeit/Studienende

#### Immobilienintegration
- ✅ **Immobilien-Cashflow** - Mieteinnahmen vs. Finanzierungskosten **IMPLEMENTIERT**
- ✅ **Immobilien-Wertsteigerung** - Historische und prognostizierte Wertentwicklung **TEILWEISE IMPLEMENTIERT**
- **Eigenheim vs. Miete Kalkulator** - Detaillierte Vergleichsrechnung über Lebensspanne
  - Kaufnebenkosten (Grunderwerbsteuer, Notar, Makler)
  - Instandhaltungsrücklage vs. gesparte Miete
  - Opportunitätskosten des gebundenen Kapitals
  - Steuervorteile bei Eigennutzung vs. Vermietung
  - Flexibilitätsverlust quantifizieren
- **Immobilien-Leverage-Optimierung** - Optimale Finanzierungsstrukturen
  - Eigenkapitalquote-Simulation (10%, 20%, 30%, 40%)
  - Zinsszenarien (fest vs. variabel)
  - Sondertilgungs-Optimierung
  - Anschlussfinanzierung-Planung
- **Erweiterte Immobilien-Steueroptimierung** - Zusätzlich zu vorhandener Integration:
  - **AfA-Rechner** - Lineare Abschreibung über 40/50 Jahre
  - **Werbungskosten-Optimierung** - Alle absetzbaren Kosten erfassen
  - **Denkmal-AfA** - Erhöhte Abschreibung bei Denkmalschutz
  - **§7h EStG** - Sonderabschreibung für Mietwohnungsneubau

#### Selbstständigkeit & Unternehmertum
- **Schwankende Einkommen für Selbstständige** - Unregelmäßige Einkommensmuster
  - Saisonale Schwankungen modellieren
  - Worst-Case/Best-Case Szenarien
  - Durchschnittliche Sparraten bei volatilen Einkommen
  - Liquiditätsplanung bei unregelmäßigen Einnahmen
- **Altersvorsorge für Selbstständige** - Rürup-Rente, Basis-Rente Alternativen
  - Steuerliche Vorteile der Rürup-Rente berechnen
  - Vergleich mit ETF-Sparplan
  - Flexible Beitragsgestaltung
  - Maximale Steuerersparnis durch Sonderausgabenabzug
- **Geschäftsrisiko-Integration** - Ausfallrisiko des Haupteinkommens
  - Insolvenzwahrscheinlichkeit nach Branche
  - Notfall-Rücklagen für Selbstständige (6-12 Monate)
  - Versicherungsschutz (BU für Selbstständige)
- **Unternehmensverkauf-Simulation** - Exit-Strategien und Steueroptimierung
  - Freibetrag bei Betriebsveräußerung (§16 EStG)
  - Tarifbegünstigung (56% Durchschnittssteuersatz)
  - Veräußerungsgewinn-Berechnung
  - Optimaler Verkaufszeitpunkt

### Versicherung & Absicherung

#### Lebensversicherungen
- **Kapitallebensversicherung-Integration** - Integration klassischer Lebensversicherungsprodukte
  - Garantieverzinsung vs. Überschussbeteiligung
  - Kosten und Gebühren transparent darstellen
  - Vergleich mit ETF-Sparplan
  - Steuerliche Behandlung (Altverträge vs. Neuverträge)
- **Fondsgebundene Lebensversicherung** - ETF-Sparpläne in Versicherungsmänteln
  - Steuervorteile nach 12 Jahren / 62 Jahren
  - Kostenvergleich mit direktem ETF-Investment
  - Flexibilität bei Beitragszahlungen
  - Hinterbliebenenschutz-Komponente
- **Risikolebensversicherung-Kalkulator** - Absicherung von Hinterbliebenen
  - Bedarfsberechnung basierend auf Familiensituation
  - Versicherungssumme über Zeit (fallend vs. konstant)
  - Kosten vs. Nutzen Analyse
  - Integration mit Erbschaftssteuer-Freibeträgen
- **Berufsunfähigkeitsversicherung** - Auswirkungen von BU-Renten auf die Finanzplanung
  - BU-Rente als Einkommensersatz simulieren
  - Dynamik-Optionen und deren Kosten
  - Vergleich: Versicherung vs. eigene Rücklagen
  - Steuerliche Behandlung von BU-Renten

#### Pflegevorsorge
- ✅ **Pflegekosten-Simulation** - Umfassende Simulation bereits **IMPLEMENTIERT**
- **Erweiterte Pflegezusatzversicherung** - Private Pflegeversicherung vs. Eigenvorsorge
  - Beitragsentwicklung über Lebenszeit
  - Leistungsvergleich verschiedener Tarife
  - Kosten-Nutzen-Rechnung mit Eintrittswahrscheinlichkeiten
  - Staatliche Förderung (Pflege-Bahr) berücksichtigen
- **Generationenvertrag bei Pflege** - Finanzielle Belastung durch Pflege von Angehörigen
  - Kosten der häuslichen Pflege durch Angehörige
  - Einkommensausfall bei Pflegezeit
  - Unterstützungsleistungen durch Pflegekasse
  - Elternunterhalt-Berechnung (wenn Eltern pflegebedürftig)

### Technische Verbesserungen

#### Datenintegration
- **Real-Time Marktdaten** - Live-Kurse und Marktindikatoren
  - Integration von Yahoo Finance, Alpha Vantage oder ähnlichen APIs
  - Aktuelle ETF/Fonds-Kurse für Portfolio-Tracking
  - Aktualisierung der Korrelationsmatrizen mit Live-Daten
  - **Hinweis**: Widerspricht Privacy-First Ansatz, nur als opt-in Feature
- **Erweiterte makroökonomische Indikatoren** - Zusätzlich zu Bundesbank-Integration:
  - **Inflation** - HVPI-Daten von Eurostat
  - **Zinsen** - EZB-Leitzinsen und Entwicklung
  - **BIP-Wachstum** - Deutsche und europäische Wachstumsraten
  - **Arbeitslosigkeit** - Einfluss auf Sparquote
- **Erweiterte Zentralbank-APIs** - Zusätzlich zu Bundesbank SDMX:
  - **ECB Statistical Data Warehouse** - Europäische Zinsdaten
  - **Fed FRED API** - US-Wirtschaftsdaten für internationale Portfolios
  - Historische Daten für erweiterte Backtesting-Szenarien
- **Benchmark-Integration** - Vergleich mit Indizes
  - Portfolio-Performance vs. MSCI World, DAX, S&P 500
  - Risk-adjusted Returns (Alpha, Beta)
  - Tracking Error Berechnung
- **Automatische Steuergesetz-Updates** - Hinweis-System bei Gesetzesänderungen
  - RSS/News-Feed für Steuerrechtsänderungen
  - Changelog für Basiszins, Freibeträge, Steuersätze
  - Opt-in Benachrichtigungen über Browser-Notifications

#### Erweiterte Analysen
- ✅ **Sensitivitätsanalyse** - Auswirkungen von Parameteränderungen **IMPLEMENTIERT**
- **Optimierungsalgorithmen** - Automatische Optimierung der Asset Allocation
  - **Mean-Variance Optimization** - Markowitz Efficient Frontier
  - **Black-Litterman Modell** - Kombination aus Marktequilibrium und Anlegererwartungen
  - **Risk Parity** - Gleichgewichtete Risikobeiträge aller Assets
  - **Maximum Sharpe Ratio** - Optimales Rendite-Risiko-Verhältnis
  - Berücksichtigung von Transaktionskosten und Steuern
- **Machine Learning Prognosen** - KI-basierte Renditeprognosen
  - **ARIMA/GARCH** - Zeitreihenmodelle für Volatilitätsprognosen
  - **Random Forest** - Klassifikation von Marktphasen (Bullen-/Bärenmarkt)
  - **Neural Networks** - Tiefe Lernmodelle für komplexe Muster
  - **Disclaimer**: Historische Performance keine Garantie für Zukunft
- **Behavioral Finance Integration** - Berücksichtigung von Anlegerverhalten
  - **Loss Aversion** - Simulation von Panikverkäufen in Krisen
  - **Overconfidence** - Auswirkungen von zu häufigem Trading
  - **Home Bias** - Deutsche vs. internationale Diversifikation
  - **Herding** - Massenpsychologie in Blasen und Crashs
  - Verhaltensökonomische Kosten quantifizieren
- **Erweiterte Stress-Tests** - Zusätzlich zu vorhandenen Black Swan Events:
  - **Custom Stress Scenarios** - Benutzer-definierte Krisenszenarien
  - **Multi-Year Drawdowns** - Japanische Lost Decade (1990-2000)
  - **Kombinierte Krisen** - Rezession + Inflation gleichzeitig
  - **Geopolitische Risiken** - Kriegsszenarien, Handelskriege
  - Recovery-Strategien für verschiedene Krisentypen

#### Reporting & Visualisierung
- ✅ **Interaktive Charts mit Area Charts, Zoom, Brush** - Bereits **IMPLEMENTIERT**
- **Dashboard-Customization** - Personalisierbare Ansichten
  - Drag-and-Drop Widget-Anordnung
  - Auswahl relevanter Metriken für Sticky Overview
  - Speicherung personalisierter Layouts im Profil
  - Responsive Layout für verschiedene Bildschirmgrößen
- **KPI-Tracking mit Zielen** - Verfolgung von Fortschritt gegenüber Zielen
  - Zielvermögen für Ruhestand definieren
  - Zwischenziele (Meilensteine) festlegen
  - Fortschrittsbalken und Prognose bis Zielerreichung
  - Alarmierung bei Abweichung vom Ziel
- **Automated Local Reporting** - Regelmäßige lokale Reports
  - Monatliche/jährliche Zusammenfassungen generieren
  - Automatischer Export als PDF in Downloads
  - E-Mail-Erinnerungen für Review (opt-in)
  - Historischer Vergleich (dieses vs. letztes Jahr)
- **Advanced Export Options** - Zusätzlich zu vorhandenem CSV/Markdown:
  - **Excel mit Formeln** - Lebendige Spreadsheets zum Weiterrechnen
  - **PDF-Reports** - Professionelle, druckbare Zusammenfassungen
  - **JSON-Export** - Maschinell verarbeitbare Datenstrukturen
  - **QIF/OFX-Format** - Import in andere Finanztools
- **3D-Visualisierungen** - Dreidimensionale Darstellung von Zeit-Rendite-Risiko
  - 3D-Surface-Plots für Multi-Parameter-Analysen
  - Rotation und Zoom für bessere Exploration
  - Interaktive Schnittebenen für Detailanalysen
  - **Hinweis**: Spektakulär, aber nicht essentiell - niedrige Priorität
- **Heatmaps** - Korrelationsmatrizen und Risikoverteilungen
  - Asset-Korrelation visualisieren
  - Zeitliche Entwicklung der Korrelationen
  - Risiko-Heatmap über Zeit und Szenarien
- **Animation/Timeline** - Zeitbasierte Animationen der Portfolioentwicklung
  - "Play"-Funktion für Jahr-für-Jahr Entwicklung
  - Highlighting wichtiger Ereignisse (Krisen, Einzahlungen)
  - Export als Video/GIF für Präsentationen
  - Vor-/Zurück-Navigation für einzelne Jahre

### Beratungs- & Bildungsfeatures

#### Finanzbildung
- **Interaktive Tutorials** - Schritt-für-Schritt Anleitungen für Einsteiger
  - Onboarding-Flow für neue Nutzer
  - Tooltips und Erklärungen bei jedem Formularfeld
  - Video-Tutorials für komplexe Features (Vorabpauschale, Multi-Asset)
  - Guided Tours durch verschiedene Funktionalitäten
- **Integriertes Glossar** - Erklärungen von Fachbegriffen direkt in der App
  - Hover-Tooltips für Fachbegriffe
  - Verlinktes Glossar-Popup mit Details
  - Deutsche und englische Begriffe (ETF = Exchange Traded Fund)
  - Suchfunktion im Glossar
- **Vordefinierte Was-wäre-wenn Szenarien** - Szenarien zum Lernen
  - "Frührentner mit 50" - Aggressive Sparquote-Simulation
  - "Durchschnittsverdiener" - Realistisches Basisszenario
  - "Einmal-Erbe" - Große Erbschaft optimal anlegen
  - "Selbstständiger" - Volatile Einkommen simulieren
  - "Familie mit 2 Kindern" - Komplette Lebensplanung
- **Verhaltensökonomie-Insights** - Aufklärung über häufige Anlegerfehler
  - Timing the Market vs. Time in the Market
  - Kosten von emotionalem Verkauf in Krisen
  - Diversifikation schlägt Stock-Picking
  - Inflation-Impact auf Cash-Bestände
  - Hinweise direkt bei relevanten Eingaben
- **Marktpsychologie-Indikatoren** - Fear & Greed Index Integration
  - CNN Fear & Greed Index als externe Datenquelle
  - Historische Korrelation zu Renditen
  - Konträre Investitionssignale bei Extremwerten
  - Deutsche Sentiment-Indikatoren (DAX Sentiment)

#### Zielsetzung & Tracking
- **SMART-Goals Integration** - Spezifische, messbare Finanzziele
  - Zieleingabe mit SMART-Kriterien Assistent
  - Automatische Berechnung benötigter Sparrate
  - Machbarkeits-Check für Ziele
  - Alternative Szenarien bei unrealistischen Zielen
- **Milestone-Tracking** - Zwischenziele und Fortschrittsverfolgung
  - 25%, 50%, 75%, 90% Meilensteine zum Hauptziel
  - Benachrichtigungen bei Erreichen von Milestones
  - Historisches Tracking über mehrere Jahre
  - Celebration-Animationen bei Zielerreichung
- **Automatische Anpassungsempfehlungen** - Empfehlungen bei Zielverfehlungen
  - "Sparrate um X€ erhöhen" für Zielerreichung
  - "Rendite-Erwartung realistisch?" Warnungen
  - Alternative Entnahmestrategien vorschlagen
  - Frühwarnsystem bei Planabweichungen
- **Retirement-Readiness Score** - Bewertung der Rentenbereitschaft
  - 0-100 Score basierend auf Vermögen, Einkommen, Ausgaben
  - Benchmarking gegen Altersgruppe
  - Detaillierter Bericht zu Stärken/Schwächen
  - Konkrete Verbesserungsvorschläge
  - Regelmäßige Neubewertung empfohlen

### Internationale Erweiterungen

#### Ländervergleiche & Expatriate-Planung
- **Internationale Steuersysteme** - Vergleiche mit anderen Ländern
  - Schweiz, Österreich, USA, UK Steuerberechnung
  - Capital Gains Tax in verschiedenen Ländern
  - Dividendenbesteuerung international
  - Side-by-Side Vergleich Deutschland vs. Zielland
- **Auswanderungs-Szenarien** - Steuerliche Auswirkungen bei Wohnsitzwechsel
  - Wegzugsbesteuerung (§6 AStG) bei Verlagerung
  - Steuerpflicht bei beschränkter vs. unbeschränkter Steuerpflicht
  - 10-Jahres-Regel bei Rückkehr
  - Optimaler Zeitpunkt für Auswanderung
- **Doppelbesteuerungsabkommen** - Berücksichtigung internationaler Vereinbarungen
  - DBA-Datenbank für alle deutschen Abkommen
  - Anrechnungsmethode vs. Freistellungsmethode
  - Quellensteuer-Erstattung simulieren
  - Formulare und Prozesse dokumentieren
- **Multi-Residency Planning** - Planung für mehrere Wohnsitze
  - 183-Tage-Regel für Steuerpflicht
  - Optimierung zwischen zwei Ländern
  - Sozialversicherungspflicht bei Mehrfachwohnsitz
  - Doppelte Krankenversicherung vermeiden
  - Digitale Nomaden und Perpetual Traveler Szenarien

### Deutsche Altersvorsorge-Systeme

#### Gesetzliche & Betriebliche Rente
- ✅ **Gesetzliche Rentenversicherung** - Vollständig **IMPLEMENTIERT**
- **Erweiterte Rentenprognose** - Detaillierte Rentenpunkt-Berechnung
  - Rentenpunkte basierend auf Einkommen berechnen
  - Hochrechnung zukünftiger Rentenpunkte
  - Rentenlücke automatisch ermitteln
  - Anpassungen für Kindererziehungszeiten
  - Erwerbsminderungsrenten-Szenarien
- **Betriebliche Altersvorsorge (bAV)** - Direktversicherung, Pensionskasse, Pensionsfonds
  - Arbeitgeberzuschuss simulieren (min. 15%)
  - Steuerliche Förderung in Ansparphase
  - Nachgelagerte Besteuerung in Entnahmephase
  - Sozialversicherungsbeiträge auf Betriebsrente
  - Portabilität bei Arbeitgeberwechsel
- **Riester-Rente** - Staatlich geförderte Altersvorsorge
  - Grundzulage und Kinderzulagen berechnen
  - Steuerliche Absetzbarkeit (Sonderausgaben)
  - Förderquote ermitteln
  - Vergleich: Riester vs. ungeförderte ETF-Anlage
  - Wohn-Riester für Immobilienerwerb
- **Rürup-Rente (Basis-Rente)** - Für Selbstständige und Gutverdiener
  - Maximale steuerliche Absetzbarkeit berechnen
  - Höchstbetrag und Anrechnung auf Freibeträge
  - Nachgelagerte Besteuerung simulieren
  - Vergleich mit privater ETF-Anlage
  - Hinterbliebenenabsicherung optional

#### Sozialversicherung & Beiträge
- ✅ **Krankenversicherung (GKV/PKV)** - Bereits **IMPLEMENTIERT**
- **Erweiterte Krankenversicherungs-Optimierung** - Für Paarplanung
  - PKV-Rückkehr in GKV (Altersgrenze 55)
  - Familienversicherung vs. freiwillige Versicherung
  - Beitragsbemessungsgrenze und Höchstbeitrag
  - Zusatzversicherungen berücksichtigen
- **Arbeitslosenversicherung** - Auswirkungen bei Arbeitslosigkeit
  - ALG I Berechnung basierend auf Einkommen
  - Dauer des Anspruchs nach Beschäftigungszeit
  - Auswirkung auf Sparraten während Arbeitslosigkeit
  - Sozialversicherungspflicht während ALG-Bezug
- **Rentenversicherung für Selbstständige** - Freiwillige Beiträge
  - Mindest- und Höchstbeiträge
  - Rentenpunkt-Erwerb durch freiwillige Beiträge
  - Vergleich: Gesetzliche Rente vs. private Vorsorge
  - Pflichtversicherung bestimmter Berufsgruppen

---

## ❌ Explizit NICHT zu entwickelnde Features

Die folgenden Features sollen entsprechend der Anforderung **NICHT** entwickelt werden:

### Community & Social Features
- **Community-Forum** - Diskussionen zwischen Nutzern
- **Social Sharing** - Teilen von Portfolios oder Ergebnissen
- **User-Generated Content** - Nutzer-erstellte Inhalte oder Strategien
- **Peer Comparisons** - Vergleiche mit anderen Nutzern
- **Rating/Review System** - Bewertungen von Strategien oder Inhalten

### Authentifizierung & Cloud
- **User Accounts** - Registrierung und Login-System
- **Cloud Storage** - Synchronisation über verschiedene Geräte
- **Multi-Device Sync** - Automatische Datensynchronisation
- **Backup-Services** - Cloud-basierte Datensicherung
- **Collaboration Features** - Gemeinsame Bearbeitung von Portfolios

### Gamification
- **Achievement System** - Erfolge und Auszeichnungen
- **Points/Badges** - Belohnungssystem für Aktivitäten
- **Leaderboards** - Ranglisten oder Wettkämpfe
- **Progress Gamification** - Spielerische Fortschrittsanzeigen
- **Financial Challenges** - Gamifizierte Sparziele

### Progressive Web App (PWA)
- **Offline-Functionality** - Funktionalität ohne Internetverbindung
- **Push Notifications** - Mobile Benachrichtigungen
- **App-Store Distribution** - Installation über App Stores
- **Background Sync** - Hintergrundsynchronisation
- **Native Mobile Features** - Kamera, GPS, etc.

---

## 📊 Priorisierung der zukünftigen Features

### Sehr Hoch (⭐⭐⭐⭐) - Quick Wins
Kleine Erweiterungen der bestehenden Kernfunktionalität mit hohem Nutzwert:
- **Kindergeld-Integration** - Einfache Ergänzung zu "Andere Einkünfte", hoher Praxisnutzen
- **Erweiterte Riester/Rürup-Rente** - Baut auf vorhandener Rentenintegration auf
- **Retirement-Readiness Score** - Nutzt vorhandene Berechnungen, gibt nützliches Feedback
- **Vordefinierte Lernszenarien** - Niedrige Implementierungskosten, hoher Bildungswert
- **Excel-Export mit Formeln** - Erweitert vorhandenen Export, von vielen Nutzern gewünscht
- **Milestone-Tracking** - Ergänzt vorhandene Simulationen mit Zielverfolgung

### Hoch (⭐⭐⭐) - Strategische Features
Direkte Erweiterung der bestehenden Kernfunktionalität mit mittlerem Aufwand:
- **Eigenheim vs. Miete Kalkulator** - Ergänzt Immobilien-Cashflow-Funktionalität
- **Betriebliche Altersvorsorge (bAV)** - Wichtig für deutsche Arbeitnehmer, komplexe Steuerregeln
- **Erweiterte AfA/Werbungskosten** - Vertiefung der Immobiliensteuer-Features
- **Longevity Risk Analyse** - Baut auf Lebenserwartungs-Berechnung auf
- **Tax-Loss Harvesting** - Fortgeschrittene Steueroptimierung für erfahrene Anleger
- **Schwankende Einkommen für Selbstständige** - Wichtig für deutschen Markt (ca. 10% Selbstständige)
- **KPI-Tracking Dashboard** - Erweitert Sticky Overview mit personalisierbaren Metriken

### Mittel (⭐⭐) - Wertvolle Ergänzungen
Nützliche Ergänzungen für fortgeschrittene Nutzer mit höherem Entwicklungsaufwand:
- **Kryptowährungen als Anlageklasse** - Hohe Volatilität, spezielle Steuerregeln, umstrittener Nutzen
- **ESG-Integration** - Wachsender Trend, aber komplexe Datenintegration erforderlich
- **Machine Learning Prognosen** - Kann vorhandene Monte Carlo Analyse ergänzen, aber hoher Aufwand
- **Faktor-Investing** - Fortgeschrittenes Portfolio-Management für erfahrene Anleger
- **Optimierungsalgorithmen (Mean-Variance)** - Ergänzt Multi-Asset-Portfolio
- **BU/Risikolebensversicherung Kalkulatoren** - Wichtige Absicherung, aber separater Themenkomplex
- **Erweiterte Stress-Tests** - Ergänzt Black Swan Events mit Custom-Szenarien
- **Heatmaps & Korrelationsvisualisierung** - Baut auf vorhandener Korrelationsmatrix auf

### Niedrig (⭐) - Nice-to-have Features
Features für spezielle Anwendungsfälle oder mit hohem Aufwand bei geringem Zusatznutzen:
- **Behavioral Finance Komponenten** - Anlegerpsychologie, eher edukativ als praktisch
- **Erweiterte Bildungsfeatures** - Tutorials und Glossar, hoher Content-Aufwand
- **Internationale Steuersysteme** - Für Auswanderer relevant, aber sehr komplex
- **3D-Visualisierungen** - Spektakulär, aber keinen praktischen Mehrwert gegenüber 2D
- **Makroökonomische Szenarien** - Sehr komplex zu modellieren, unsichere Prognosen
- **Real-Time Marktdaten** - Widerspricht Privacy-First Ansatz, nicht essentiell
- **Animation/Timeline** - Nett für Präsentationen, aber kein Kernfeature
- **Unternehmensverkauf-Simulation** - Sehr spezialisiert, kleine Zielgruppe

### Nicht empfohlen (⛔) - Zu komplex oder außerhalb Scope
- **Multi-Währungs-Portfolios** - Extreme Komplexität, Wechselkursrisiken schwer zu modellieren
- **Private Equity, Hedge Funds** - Illiquide Assets, schwer für Privatanleger zugänglich
- **Tail-Risk Hedging (Optionen)** - Sehr spezialisiert, hohe Kosten, für Retail-Investoren unpraktisch
- **Auswanderungs-Szenarien (komplett)** - Zu komplex, zu viele länderspezifische Regeln

---

## 🎯 Strategische Empfehlungen

### Fokus auf Deutsche Finanzplanung
Das Projekt sollte seinen Fokus auf die präzise Abbildung der deutschen Finanzlandschaft beibehalten und entsprechend erweitern. Die bereits implementierten Features (Vorabpauschale, Günstigerprüfung, Kirchensteuer, Pflegekosten, Erbschaftsteuer) zeigen den richtigen Weg.

**Empfohlene nächste Schritte:**
1. **Deutsche Altersvorsorge vertiefen** - Riester, Rürup, bAV als logische Ergänzung zur gesetzlichen Rente
2. **Lebensplanung erweitern** - Kindergeld, Elternzeit, Ausbildungskosten für realistische Familienplanung
3. **Immobilien-Features ausbauen** - Eigenheim vs. Miete, AfA-Rechner als Ergänzung zu Cashflow

### Technische Exzellenz vor Feature-Breite
Anstatt viele oberflächliche Features hinzuzufügen, sollten neue Funktionalitäten die bestehende hohe technische Qualität beibehalten.

**Quality Gates für neue Features:**
- **Test-Coverage ≥ 90%** - Jedes neue Feature umfassend getestet
- **TypeScript strict mode** - Keine any-Types ohne Begründung
- **Deutsche UX** - Alle Texte, Fehlermeldungen, Tooltips auf Deutsch
- **Mobile-First** - Responsive Design von Anfang an
- **Performance** - Client-side Berechnungen, Real-time Updates

### Benutzerfreundlichkeit & Zugänglichkeit
Neue Features sollten die hohen UX-Standards mit shadcn/ui und responsivem Design beibehalten.

**UX-Prinzipien:**
- **Progressive Disclosure** - Komplexe Features hinter Collapsibles verstecken
- **Smart Defaults** - Realistische Voreinstellungen (z.B. 5% Rendite, 2% Inflation)
- **Guided Workflows** - Schritt-für-Schritt Assistenten für komplexe Szenarien
- **Inline-Hilfe** - Tooltips und Erklärungen direkt bei Eingabefeldern
- **Fehlertoleranz** - Validierung mit hilfreichen Fehlermeldungen

### Privacy-First & Offline-First Ansatz
Die bewusste Entscheidung gegen PWA und Cloud-Features zugunsten lokaler Datenhaltung respektiert die Privatsphäre der Nutzer und reduziert Komplexität.

**Privacy-Prinzipien beibehalten:**
- **Lokale Datenhaltung** - Alle Berechnungen im Browser, keine Server-Kommunikation
- **Opt-in für externe APIs** - Nur mit expliziter Zustimmung (z.B. Bundesbank-API)
- **Keine Tracking-Cookies** - Vercel Analytics als einzige Ausnahme
- **Export statt Cloud** - Nutzer kontrolliert seine Daten vollständig

### Inkrementelle Entwicklung
Neue Features sollten iterativ entwickelt werden, mit kontinuierlichem Nutzer-Feedback.

**Entwicklungsprozess:**
1. **Feature-Proposal** - Konzept mit Use-Cases und User Stories
2. **Prototype** - Minimal viable implementation mit Tests
3. **Beta-Testing** - Feedback von Power-Users einholen
4. **Iteration** - Basierend auf Feedback verbessern
5. **Documentation** - README.md und inline-Hilfe aktualisieren
6. **Release** - Mit Changelog und Migration-Guide

---

## 🔧 Implementierungsaspekte

### Technische Architektur
Neue Features sollten die bestehende Architektur-Prinzipien respektieren:
- **State Management**: Lokale React Hooks für Client-Only Architektur
  - useState/useReducer für Komponenten-State
  - Custom Hooks für wiederverwendbare Logik (z.B. useWithdrawalConfig)
  - Profilverwaltung über localStorage mit TypeScript-Interfaces
- **Testing**: Comprehensive Test-Coverage für alle neuen Funktionalitäten
  - Unit-Tests für Helper-Funktionen (Vitest)
  - Component-Tests mit React Testing Library
  - Integration-Tests für komplexe Workflows
  - Minimum 90% Code-Coverage Ziel
- **Performance**: Client-side Berechnungen für Echtzeit-Updates
  - Memoization für teure Berechnungen (useMemo, useCallback)
  - Lazy Loading für große Komponenten
  - Optimierte Rendering-Performance (React.memo wo sinnvoll)
- **UI Framework**: Konsistente shadcn/ui Nutzung
  - Alle neuen Komponenten mit shadcn/ui bauen
  - Tailwind CSS utility classes ausschließlich
  - Keine custom CSS-Dateien erstellen
  - Lucide React Icons für Konsistenz

### Deutsche Finanzgesetzgebung
Neue steuerliche Features müssen deutsche Gesetzgebung korrekt abbilden:
- **Präzision**: Exakte Umsetzung von Steuerregeln und -berechnungen
  - Gesetzestexte als Quelle (EStG, InvStG, ErbStG)
  - Aktuelle Freibeträge und Grenzwerte verwenden
  - Rundungsregeln beachten (§118 AO)
  - Berechnungen dokumentieren und referenzieren
- **Aktualität**: Berücksichtigung aktueller und zukünftiger Gesetzesänderungen
  - Parametrisierung von Freibeträgen, Steuersätzen
  - Basiszins-Konfiguration als Vorbild nutzen
  - Changelog bei Gesetzesänderungen pflegen
  - Hinweise auf Gültigkeitszeiträume
- **Vollständigkeit**: Umfassende Abdeckung relevanter Steueraspekte
  - Vorabpauschale, Teilfreistellung, Günstigerprüfung
  - Solidaritätszuschlag, Kirchensteuer
  - Freibeträge (Sparerpauschbetrag, Grundfreibetrag)
  - Progressionsvorbehalt bei ausländischen Einkünften
- **Validierung**: Tests mit realistischen Beispielfällen
  - Testfälle aus Steuerberater-Literatur
  - Grenzfälle und Edge-Cases abdecken
  - Vergleich mit kommerziellen Steuertools

### Code-Qualitäts-Standards
- **TypeScript-First**: Typsichere Entwicklung für alle neuen Features
  - Strikte TypeScript-Konfiguration nutzen
  - Interfaces für alle Datenstrukturen
  - Generics für wiederverwendbare Funktionen
  - Keine any-Types ohne explizite Begründung
- **Test-Driven Development**: Comprehensive Test-Coverage für neue Funktionalitäten
  - Tests vor oder während Implementierung schreiben
  - AAA-Pattern (Arrange, Act, Assert)
  - Descriptive Test-Namen auf Deutsch
  - Edge-Cases explizit testen
- **German-Centric**: Deutsche Benutzeroberfläche und Steuergesetzgebung im Fokus
  - Alle UI-Texte auf Deutsch
  - Fehlermeldungen verständlich formulieren
  - Tooltips mit Erklärungen zu deutschen Begriffen
  - Datumsformate: DD.MM.YYYY
  - Währung: € mit deutschem Zahlenformat (1.234,56 €)
- **Privacy-Focused**: Lokale Datenhaltung ohne externe Services
  - Keine Daten an Server senden (außer opt-in APIs)
  - LocalStorage für Persistierung
  - Keine Cookies (außer Vercel Analytics)
  - Transparente Datennutzung kommunizieren

### Entwicklungsprinzipien für neue Features
1. **Deutsche Gesetzeskonformität** - Alle steuerlichen Features müssen deutsche Gesetzgebung korrekt abbilden
   - Quellen zitieren (§-Referenzen)
   - Bei Unsicherheit: Conservative estimates
   - Disclaimer bei komplexen Steuerszenarien
2. **Echtzeit-Berechnungen** - Neue Features sollten sofortige Updates ermöglichen
   - Debouncing bei häufigen Änderungen (z.B. Slider)
   - Optimistische Updates für bessere UX
   - Loading-States nur bei wirklich langen Berechnungen
3. **Test-Coverage ≥ 90%** - Minimum Test-Abdeckung für neue Funktionalitäten
   - Jest/Vitest Coverage-Reports nutzen
   - Kritische Pfade zu 100% testen
   - Edge-Cases explizit abdecken
4. **Mobile-First** - Responsive Design für alle neuen UI-Komponenten
   - Mobile Ansicht zuerst designen
   - Touch-friendly Controls (min. 44x44px)
   - Testen auf verschiedenen Bildschirmgrößen
5. **Accessibility** - shadcn/ui Standards für Barrierefreiheit einhalten
   - Semantisches HTML nutzen
   - ARIA-Labels wo nötig
   - Keyboard-Navigation sicherstellen
   - Farbkontraste prüfen (WCAG AA)

### Feature-Implementierungs-Checkliste
Für jedes neue Feature folgende Schritte durchlaufen:
- [ ] **Konzept** - Use-Cases, User Stories, Mock-ups erstellen
- [ ] **API-Design** - TypeScript-Interfaces und Funktionssignaturen definieren
- [ ] **Tests schreiben** - Test-Cases vor Implementierung definieren
- [ ] **Helper-Funktionen** - Business-Logik in helpers/ implementieren und testen
- [ ] **UI-Komponenten** - React-Komponenten mit shadcn/ui bauen
- [ ] **Integration** - In bestehende Komponenten einbinden (HomePage, etc.)
- [ ] **Manuelle Tests** - Verschiedene Szenarien durchspielen
- [ ] **Dokumentation** - README.md, Tooltips, Code-Kommentare aktualisieren
- [ ] **Review** - Code-Review durch anderen Entwickler
- [ ] **Deployment** - Staging-Test vor Production-Release

---

## 📈 Statistik & Metadaten

**Anzahl potenzielle Features:** 120+  
**Anzahl bereits implementiert:** 45+ (siehe Abschnitt "Bereits implementierte Features")  
**Anzahl explizit ausgeschlossen:** 20+ (siehe Abschnitt "Explizit NICHT zu entwickelnde Features")  

**Letzte Aktualisierung:** Januar 2025  
**Basis:** Vollständige Analyse der copilot-instructions.md, README.md und des bestehenden Codes  
**Status:** Umfassender Katalog mit Priorisierung und Implementierungsrichtlinien

**Changelog:**
- **Januar 2025**: Große Überarbeitung mit Fokus auf deutsche Altersvorsorge, detaillierte Priorisierung, erweiterte Implementierungsaspekte
- **Dezember 2024**: Initiale Version mit 90+ Features und expliziten Ausschlüssen