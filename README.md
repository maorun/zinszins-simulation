
# Zinseszins-Rechner

Ziel des Projektes is es ein Rechner zu entwickeln, indem man viele Einstellungen vornehmen kann und vieles berücksichtigt wird.

Stand der Entwicklung unter https://zinszins-simulation.vercel.app/

---
Folgendes ist umgesetzt:
- Zeitspanne
- Rendite
    - monatlich
    - jährlich
    - **Zufällige Rendite (NEU!)** - Monte Carlo Simulation mit konfigurierbarer durchschnittlicher Rendite und Volatilität
    - **Variable Rendite pro Jahr (NEU!)** - Jahr-für-Jahr konfigurierbare Renditen für realistische Szenarien
- Sparplan
    - jährlich
    - **monatlich (schon implementiert)**
    - monatlich
- Einmalzahlungen
- Einberechnung der Freibeträge bei der Steuer
- **Konfigurierbare Steuerparameter (NEU!)**
    - Kapitalertragsteuer (standardmäßig 26,375%)
    - Teilfreistellungsquote für Aktienfonds (standardmäßig 30%)
    - **Freibetrag pro Jahr (NEU!)** - Individuelle Konfiguration der jährlichen Steuerfreibeträge
- **Auszahlungsphase (NEU!)**
    - 4% Regel - jährliche Entnahme von 4% des Startkapitals
    - 3% Regel - jährliche Entnahme von 3% des Startkapitals
    - **Monatliche Entnahme-Strategien (NEU!)** - Feste monatliche Entnahmen mit Inflationsanpassung und Portfolio-Guardrails
    - Berücksichtigung der Renditen während der Entnahme
    - Berücksichtigung der deutschen Steuerberechnung (Vorabpauschale)
    - Jahr-für-Jahr Entnahmeprojektion mit detaillierter Aufschlüsselung
    - Interaktive Parametereinstellung (Rendite, Lebensende, Strategie)
---
Folgendes ist noch gepant:
- Steuern
    - ~~Freibetrag pro Jahr (bisher ein fester Steuerfreibetrag von 2000)~~ ✓ Umgesetzt
- Rendite
    - ~~variabel pro Jahr~~ ✓ Umgesetzt
- Auszahlungsphase (Erweiterungen)
    - Berücksichtigung des Grundfreibetrages für Einkommensteuer
    - Variable Renditen pro Jahr
---
Folgendes könnte noch gemacht werden, aber noch nicht notwending
- ~~Eingabe der Kapitalertragsteuer (momentan bei 26,375 %)~~ ✓ Umgesetzt
- ~~Eingabe der Teilfreistellungsquote (30% für Aktienfonds nach https://de.wikipedia.org/wiki/Investmentsteuergesetz_(Deutschland)#Besteuerung_deutscher_Anleger_in_Investmentfonds_mit_(partieller)_Kompensation_der_Steuervorbelastung )~~ ✓ Umgesetzt
