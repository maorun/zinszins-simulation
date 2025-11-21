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
  - **Individuelle Konfiguration** - Separate Einstellung von erwarteter Rendite, Volatilität und Zielallokation für jede Anlageklasse
  - **Portfolio-Übersicht** - Real-time Berechnung der erwarteten Portfolio-Rendite und des Portfolio-Risikos
  - **Portfolio-Optimierung** - Automatische Optimierung der Asset Allocation
    - **3 Optimierungsziele** - Maximale Sharpe Ratio, Minimales Risiko, Maximale Rendite
    - **Korrelationsberücksichtigend** - Nutzt Korrelationsmatrix für realistische Portfolio-Varianz-Berechnung
    - **Gradient-basierte Optimierung** - Effiziente Optimierung mit finiten Differenzen
    - **Ergebnisanzeige** - Erwartete Rendite, Risiko, Sharpe Ratio und optimierte Allokationen
    - **Ein-Klick-Anwendung** - Optimierte Allokationen können direkt übernommen werden
  - **Automatisches Rebalancing** - Konfigurierbare Rebalancing-Häufigkeit (jährlich, quartalsweise, monatlich) mit Schwellenwert-basiertem Rebalancing
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
- **Inflation** - Berücksichtigung während der Ansparphase mit automatischer Anpassung
  - **Inflationsbereinigte Werte** - Zusätzliche Anzeige der realen Kaufkraft (inflationsbereinigt) neben Nominalwerten
  - **Sparphase**: Alle Kapitalwerte werden sowohl nominal als auch real angezeigt (z.B. "793.512,75 € / 589.591,66 € real")
  - **Entnahmephase**: Entnahmebeträge und Kapitalwerte zeigen sowohl nominale als auch reale Kaufkraft

### Sparplan, Einmalzahlungen und Sonderereignisse

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
- **Konfigurierbare Parameter**: Kapitalertragsteuer, Teilfreistellungsquote, Freibetrag pro Jahr
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
  - **BU-Renten-Integration** - Umfassende Berücksichtigung von Berufsunfähigkeitsrenten
    - **Leibrenten-Besteuerung**: Korrekte steuerliche Behandlung nach § 22 EStG mit altersabhängigem Ertragsanteil
    - **Flexible Zeiträume**: Konfigurierbare Start- und Endjahre für Berufsunfähigkeitsphasen
    - **Automatische Steuerberechnung**: Nur der Ertragsanteil wird besteuert, Rest ist steuerfrei
    - **Altersabhängige Besteuerung**: Ertragsanteil variiert je nach Alter bei Beginn der Berufsunfähigkeit (z.B. 36% bei 40 Jahren)
    - **Dokumentation des BU-Grads**: Erfassung des Berufsunfähigkeitsgrades (0-100%) für Übersichtszwecke
    - **Dauerhafte oder temporäre BU**: Unterstützung sowohl für permanente als auch zeitlich begrenzte Berufsunfähigkeit
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
  - **Immobilien-Cashflow Integration** - Umfassende Immobilienertragsberechnung mit deutschen Steuerregeln
    - **Realistische Kostenfaktoren**: Instandhaltungskosten (0-30%), Leerstandsquote (0-20%), Finanzierungskosten
    - **Wertsteigerungsberechnung**: Optionale Berücksichtigung der Immobilienwertsteigerung als zusätzliches Einkommen
    - **Deutsche Immobiliensteuer**: Vollständige Integration der steuerlichen Behandlung von Mieteinnahmen
    - **Inflationsanpassung**: Automatische Mietanpassungen über die Entnahmephase
  - **Weitere Einkommensarten**: Private Renten, Gewerbeeinkünfte, Kapitalerträge, sonstige Einkünfte
  - **Brutto-/Netto-Konfiguration**: Flexible Eingabe mit automatischer Steuerberechnung
  - **Zeitraum-Flexibilität**: Konfigurierbare Start- und Endjahre für zeitlich begrenzte Einkünfte

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
- **Inflationsszenarien** - Simulation verschiedener Inflationsentwicklungen für Portfolioanalyse
  - **Hyperinflation** - Anhaltend hohe Inflation (8-12% p.a.) ähnlich der 1970er Jahre
  - **Deflation** - Negative Inflation (-2% bis 0%) ähnlich Japan in den 1990er Jahren
  - **Stagflation** - Kombination aus hoher Inflation (6-8%) und reduzierten Renditen
  - **Kaufkraftverlust-Berechnung** - Automatische Berechnung des realen Kaufkraftverlusts über die Szenariodauer
  - **Kumulative Inflation** - Gesamtinflation und durchschnittliche jährliche Inflationsrate
  - **Rendite-Anpassungen** - Bei Stagflation werden Renditen automatisch reduziert
  - **Flexible Zeitplanung** - Wählbares Startjahr für Inflationsszenario innerhalb des Anlagezeitraums
  - **Kombinierbar mit variablen Renditen** - Integration in bestehende Variable-Renditen-Konfiguration
- **Erweiterte Risikobewertung** - Value-at-Risk (5% & 1% VaR), Maximum Drawdown, Sharpe Ratio, Sortino Ratio, Calmar Ratio
- **Risiko-Zeitreihen** - Detaillierte Drawdown- und Rendite-Serien für tiefere Analyse
- **Detaillierte Simulation** - Jahr-für-Jahr Aufschlüsselung mit Vorabpauschale-Berechnungen
- **Berechnungsaufschlüsselung** - Interaktive Erklärungen für Steuer- und Zinsberechnungen
- **Daten Export** - CSV Export, Excel Export (mit Formeln), Markdown Export, Parameter Export für alle Simulationsdaten (inkl. Sonderereignisse)
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
