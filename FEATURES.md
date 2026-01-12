# Zinseszins-Simulation - Potenzielle Features

Diese Dokumentation listet potenzielle zukünftige Erweiterungen und explizit nicht umzusetzende Features für den deutschen Zinseszins-Rechner auf.

## 🔮 Potenzielle zukünftige Features

### Konkrete implementierbare Features (Hoch ⭐⭐⭐)

#### Steueroptimierung & Finanzplanung

- **Progressionsvorbehalt-Rechner** - Berechnung der Steuerauswirkung durch Progressionsvorbehalt bei steuerfreien Einkünften (Elterngeld, Arbeitslosengeld, Kurzarbeitergeld, Krankengeld)
  - **Automatische Berechnung**: Wie steuerfreie Einkünfte den Steuersatz auf andere Einkünfte erhöhen
  - **Mehrere Einkunftsarten**: Unterstützung verschiedener steuerfreier Einkünfte mit unterschiedlichen Progressionsvorbehalt-Regeln
  - **Jährliche Steuerbelastung**: Transparente Darstellung der Mehrbelastung durch Progressionsvorbehalt
  - **Optimierungsempfehlungen**: Hinweise zur Steuerplanung bei steuerfreien Einkünften
  - **Integration in Simulation**: Berücksichtigung in Spar- und Entnahmephase

- **Verlusttopf-Management** - Verwaltung und Optimierung von steuerlichen Verlustvorträgen
  - **Drei Verlusttöpfe**: Aktien, sonstige Kapitalerträge, Termingeschäfte nach deutschem Steuerrecht
  - **Verlustvortrag-Tracking**: Mehrjährige Verfolgung nicht genutzter Verluste
  - **Optimale Verrechnung**: Empfehlungen für strategische Verlustnutzung
  - **Depotübergreifend**: Verwaltung von Verlusttöpfen über mehrere Depots

- **Denkmal-AfA / Denkmalschutz-Immobilien** - Steuervorteile bei denkmalgeschützten Immobilien
  - **Erhöhte AfA**: 9% über 8 Jahre, dann 7% über 4 Jahre nach § 7i EStG
  - **Sanierungskosten**: Besondere Abschreibungsmöglichkeiten für denkmalgerechte Sanierung
  - **Eigennutzung vs. Vermietung**: Vergleich der steuerlichen Vorteile
  - **ROI-Kalkulation**: Vollständige Wirtschaftlichkeitsberechnung inkl. Steuervorteile

### Erweiterte Finanzplanung

#### Asset Allocation & Portfolio-Management

- **Smart Beta Strategien** - Faktor-basierte Indexstrategien ohne aktives Management
  - **Regelbasierte Strategien**: Quality, Low Volatility, Dividend Yield, Multi-Factor
  - **Kostenvergleich**: Smart Beta ETFs vs. traditionelle Marktkapitalisierungs-Indizes
  - **Tracking Difference**: Analyse der Abweichung vom Referenzindex
  - **Rendite-Risiko-Profil**: Historische Performance-Analyse verschiedener Strategien

#### Entnahmestrategien & Kapitalplanung

- **Zeitweise Rückkehr in den Arbeitsmarkt** - Simulation von Teilzeit-Arbeit im Ruhestand
  - **Flexible Arbeitsphasen**: Konfigurierbare Zeiträume mit Teilzeiteinkommen
  - **Steuerliche Integration**: Berücksichtigung von Einkommen + Renten + Kapitalerträgen
  - **Sozialversicherung**: Automatische Berechnung von KV/PV-Beiträgen
  - **Portfolio-Schonung**: Reduzierte Entnahmen während Arbeitsphasen

- **Renten-Auffüll-Strategie** - Optimierung freiwilliger Rentenbeiträge
  - **Nachkauf von Rentenpunkten**: Berechnung der Wirtschaftlichkeit von Rentenpunkten-Nachkauf
  - **Ausgleich von Rentenabschlägen**: Kalkulation für vorzeitigen Renteneintritt ohne Abschläge
  - **Steuervorteile**: Volle Absetzbarkeit freiwilliger Beiträge als Vorsorgeaufwendungen
  - **Break-Even-Analyse**: Ab wann sich Nachzahlungen rentieren

### Lebenssituationen & Planung

#### Selbstständigkeit & Unternehmertum

- **Geschäftsrisiko-Integration** - Ausfallrisiko des Haupteinkommens für Selbstständige
  - **Einkommensvolatilität**: Simulation schwankender Geschäftseinkünfte
  - **Notfallreserve**: Erhöhte Liquiditätsreserven (12-18 Monate)
  - **Krankentagegeld**: Integration von Krankentagegeldversicherung
  - **Saisonalität**: Berücksichtigung saisonaler Geschäftszyklen

- **Unternehmensverkauf-Simulation** - Exit-Strategien und Steueroptimierung
  - **Veräußerungsgewinn**: Besteuerung nach § 16 EStG mit Freibetrag
  - **Fünftelregelung**: Ermäßigte Besteuerung bei außerordentlichen Einkünften
  - **Timing-Optimierung**: Optimaler Verkaufszeitpunkt unter Steueraspekten
  - **Reinvestitions-Planung**: Strategie zur Anlage des Erlöses

#### Familie & Generationen

- **Großeltern-Enkel-Finanzplanung** - Unterstützung von Enkeln durch Schenkungen und Sparpläne
  - **Enkel-Sparplan**: Aufbau von Vermögen für Enkel mit Schenkungssteuerfreibeträgen
  - **Ausbildungsfinanzierung**: Planung für Studium oder Berufsausbildung
  - **Steuergünstige Übertragung**: Optimale Nutzung des 400.000€ Freibetrags
  - **Zeitliche Staffelung**: 10-Jahres-Perioden optimal nutzen

### Technische Verbesserungen

#### Datenintegration

- **Makroökonomische Indikatoren** - Inflation, Zinsen, BIP-Wachstum
- **Erweiterte APIs** - ECB, Fed, andere Zentralbank-Daten
- **Steuergesetz-Updates** - Automatische Updates bei Gesetzesänderungen

#### Erweiterte Analysen

- **Machine Learning Prognosen** - KI-basierte Renditeprognosen
- **Behavioral Finance** - Berücksichtigung von Anlegerverhalten

#### Reporting & Visualisierung

- **3D-Visualisierungen** - Dreidimensionale Darstellung von Zeit-Rendite-Risiko-Zusammenhängen

#### Steueroptimierung & Strategien

### Beratungs- & Bildungsfeatures

#### Finanzbildung

---

## ❌ Explizit NICHT zu entwickelnde Features

Die folgenden Features sollen entsprechend der Anforderung **NICHT** entwickelt werden:

### Ausländische Steuerkalkulationen

**⚠️ WICHTIG: Diese Anwendung ist ausschließlich auf deutsches Steuerrecht ausgerichtet.**

---

- **Ausländische Steuersysteme** - Keine Implementierung von Steuerberechnungen anderer Länder (z.B. Schweiz, Österreich, USA, UK)
- **Internationale Steuerkalkulationen** - Keine Berechnungen nach ausländischem Steuerrecht
- **Multi-Country Tax Planning** - Keine gleichzeitige Steuerplanung für mehrere Länder
- **Foreign Tax Credit Calculations** - Keine Anrechnung ausländischer Steuern
- **Cross-Border Tax Optimization** - Keine grenzüberschreitende Steueroptimierung
- **International Tax Treaties** - Keine Implementierung von Doppelbesteuerungsabkommen (außer als informative Hinweise)

#### Begründung

1. **Fokus auf deutsche Gesetzgebung**: Die Anwendung ist speziell für deutsche Steuerverhältnisse entwickelt
2. **Komplexität**: Internationale Steuersysteme sind sehr komplex und länderspezifisch
3. **Wartbarkeit**: Jedes zusätzliche Steuersystem erhöht den Wartungsaufwand erheblich
4. **Rechtssicherheit**: Nur deutsches Steuerrecht wird korrekt und aktuell abgebildet
5. **Zielgruppe**: Die Anwendung richtet sich an in Deutschland steuerpflichtige Personen

#### Erlaubt: Deutsche Auslandsinvestitionen

Die folgenden Aspekte im Kontext **deutscher Besteuerung** sind **erlaubt**:

- **Ausländische Kapitalerträge unter deutschem Steuerrecht** - Besteuerung von ausländischen Dividenden/Zinsen in Deutschland
- **Quellensteueranrechnung** - Anrechnung ausländischer Quellensteuer auf deutsche Kapitalertragsteuer (soweit für deutsche Steuerpflichtige relevant)
- **Ausschüttungsgleiche Erträge** - Besteuerung von Thesaurierungen ausländischer Fonds nach deutschem Recht
- **Währungsgewinne/-verluste** - Steuerliche Behandlung nach deutschem Steuerrecht

**Wichtig**: Auch bei diesen erlaubten Features gilt: Die Berechnung erfolgt immer nach **deutschem Steuerrecht** für in Deutschland steuerpflichtige Personen.

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

## 🤖 Entwicklungsrichtlinie: Keine KI/ML-Implementierungen

**Wichtige Klarstellung zur Feature-Entwicklung:**

Diese Anwendung ist ein **transparentes, nachvollziehbares Finanzplanungswerkzeug** für deutsche Steuerverhältnisse. Entsprechend gelten folgende Richtlinien für AI/ML-bezogene Features:

### ❌ NICHT zu entwickeln: Echte KI/ML-Funktionalität

Die folgenden Technologien und Ansätze sollen **NICHT** implementiert werden:

- **Machine Learning Modelle** - Keine neuronalen Netze, keine trainierten ML-Modelle
- **KI-basierte Prognosen** - Keine "intelligenten" Vorhersagemodelle mit ML-Training
- **AI-Algorithmen** - Keine selbstlernenden oder adaptiven Algorithmen
- **Natural Language Processing** - Keine Sprachverarbeitung oder ChatBot-Features
- **Computer Vision** - Keine Bilderkennungs- oder Analysefunktionen
- **Predictive Analytics mit ML** - Keine ML-basierten Vorhersagen
- **Reinforcement Learning** - Keine selbstoptimierenden Agenten
- **Deep Learning** - Keine tiefen neuronalen Netze jeglicher Art

### Begründung

1. **Transparenz**: Alle Berechnungen müssen für Nutzer nachvollziehbar sein
2. **Verlässlichkeit**: Deterministische Berechnungen ohne "Black Box"-Effekte
3. **Datenschutz**: Keine Datensammlung für ML-Training
4. **Komplexität**: Fokus auf bewährte, verständliche Finanzrechenmethoden
5. **Wartbarkeit**: Code bleibt wartbar ohne ML-Infrastruktur

### ✅ Erlaubt: Pseudo-KI und etablierte Algorithmen

Die folgenden Ansätze sind **ausdrücklich erlaubt** und können bei Bedarf verwendet werden:

- **Monte Carlo Simulation** - Statistische Simulation durch Zufallsziehungen (kein ML)
- **Optimierungsalgorithmen** - Mathematische Optimierung (z.B. Portfolio-Allokation)
- **Statistische Analysen** - Varianz, Standardabweichung, Perzentile, etc.
- **Deterministische Regelbasierte Systeme** - Wenn-Dann-Logik ohne maschinelles Lernen
- **Heuristische Algorithmen** - Faustregeln und bewährte Finanzplanungs-Heuristiken
- **Pseudo-KI Marketing-Begriffe** - Begriffe wie "Intelligente Planung" für regelbasierte Logik (optional, nicht erforderlich)

### Betroffene Features in dieser Liste

Die folgenden Features in diesem Dokument sind als "**NICHT zu implementieren**" zu betrachten, wenn sie echte KI/ML erfordern würden:

- **Machine Learning Prognosen** (Zeile 81) - Nur wenn echtes ML gemeint ist; statistische Prognosen erlaubt
- **Behavioral Finance mit ML** (Zeile 82) - Nur regelbasierte Verhaltensmodelle erlaubt, kein ML

**Alternative Umsetzungen** dieser Features ohne KI/ML sind ausdrücklich **möglich und erwünscht**, wenn sie auf etablierten statistischen und mathematischen Methoden basieren.

### Zusammenfassung

- **❌ Keine echten AI/ML-Implementierungen**
- **✅ Statistische und mathematische Methoden ausdrücklich erlaubt**
- **✅ Pseudo-KI Begriffe für Marketing erlaubt (optional)**
- **✅ Transparente, nachvollziehbare Berechnungen im Fokus**

---

## 📊 Priorisierung der zukünftigen Features

### Hoch (⭐⭐⭐)

Direkte Erweiterung der bestehenden Kernfunktionalität.

### Mittel (⭐⭐)

Nützliche Ergänzungen für fortgeschrittene Nutzer:

- **Machine Learning Prognosen** - Kann vorhandene Monte Carlo Analyse ergänzen
- **Versicherungsintegration** - (BU-Versicherung, Risikolebensversicherung und Pflegezusatzversicherung bereits implementiert)

### Niedrig (⭐)

Nice-to-have Features für spezielle Anwendungsfälle:

- **ESG-Integration** - Nachhaltiges Investieren
- **Behavioral Finance Komponenten** - Anlegerpsychologie
- **Erweiterte Bildungsfeatures** - Tutorials und Glossar
- **3D-Visualisierungen** - Spektakulär, aber nicht essentiell
- **Makroökonomische Szenarien** - Sehr komplex zu implementieren

---

## 🎯 Strategische Empfehlungen

### Fokus auf Deutsche Finanzplanung

Das Projekt sollte seinen Fokus auf die präzise Abbildung der deutschen Finanzlandschaft beibehalten und entsprechend erweitern.

### Technische Exzellenz vor Feature-Breite

Anstatt viele oberflächliche Features hinzuzufügen, sollten neue Funktionalitäten die bestehende hohe technische Qualität beibehalten.

### Benutzerfreundlichkeit

Neue Features sollten die hohen UX-Standards mit shadcn/ui und responsivem Design beibehalten.

### Offline-First Ansatz

Die bewusste Entscheidung gegen PWA und Cloud-Features zugunsten lokaler Datenhaltung respektiert die Privatsphäre der Nutzer und reduziert Komplexität.

---

## 🔧 Implementierungsaspekte

### Technische Architektur

Neue Features sollten die bestehende Architektur-Prinzipien respektieren:

- **State Management**: Lokale React Hooks für Client-Only Architektur
- **Testing**: Test-Coverage für alle neuen Funktionalitäten
- **Performance**: Client-side Berechnungen für Echtzeit-Updates
- **UI Framework**: Konsistente shadcn/ui Nutzung

### Deutsche Finanzgesetzgebung

Neue steuerliche Features müssen deutsche Gesetzgebung korrekt abbilden:

- **Präzision**: Exakte Umsetzung von Steuerregeln und -berechnungen
- **Aktualität**: Berücksichtigung aktueller und zukünftiger Gesetzesänderungen
- **Vollständigkeit**: Umfassende Abdeckung relevanter Steueraspekte

### Code-Qualitäts-Standards

- **TypeScript-First**: Typsichere Entwicklung für alle neuen Features
- **Test-Driven**: Comprehensive Test-Coverage für neue Funktionalitäten
- **German-Centric**: Deutsche Benutzeroberfläche und Steuergesetzgebung im Fokus
- **Privacy-Focused**: Lokale Datenhaltung ohne externe Services

### Entwicklungsprinzipien für neue Features

1. **Deutsche Gesetzeskonformität** - Alle steuerlichen Features müssen deutsche Gesetzgebung korrekt abbilden
2. **Echtzeit-Berechnungen** - Neue Features sollten sofortige Updates ermöglichen
3. **Test-Coverage** - Minimum 90% Test-Abdeckung für neue Funktionalitäten
4. **Mobile-First** - Responsive Design für alle neuen UI-Komponenten
5. **Accessibility** - shadcn/ui Standards für Barrierefreiheit einhalten

---

**Letzte Aktualisierung:** Dezember 2024  
**Basis:** Vollständige Analyse der copilot-instructions.md und des bestehenden Codes  
**Status:** Katalog mit 90+ potenziellen Features und expliziten Ausschlüssen
