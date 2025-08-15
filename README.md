
# Zinseszins-Rechner

Ziel des Projektes is es ein Rechner zu entwickeln, indem man viele Einstellungen vornehmen kann und vieles berücksichtigt wird.

Stand der Entwicklung unter https://zinszins-simulation.vercel.app/

---
Folgendes ist umgesetzt:
- Zeitspanne
- Rendite
    - monatlich
    - jährlich
- Sparplan
    - jährlich
    - monatlich
- Einmalzahlungen
- Einberechnung der Freibeträge bei der Steuer
- **Auszahlungsphase (NEU!)**
    - 4% Regel - jährliche Entnahme von 4% des Startkapitals
    - 3% Regel - jährliche Entnahme von 3% des Startkapitals
    - Berücksichtigung der Renditen während der Entnahme
    - Berücksichtigung der deutschen Steuerberechnung (Vorabpauschale)
    - Jahr-für-Jahr Entnahmeprojektion mit detaillierter Aufschlüsselung
    - Interaktive Parametereinstellung (Rendite, Lebensende, Strategie)
---
Folgendes ist in Bearbeitung
- Einberechnung der Vorabpauschale 
---
Folgendes ist noch gepant:
- Steuern
    - Freibetrag pro Jahr (bisher ein fester Steuerfreibetrag von 2000)
- Rendite
    - variabel pro Jahr
    - zufall (im mittel X %)
- Auszahlungsphase (Erweiterungen)
    - Berücksichtigung des Grundfreibetrages für Einkommensteuer
    - Variable Renditen pro Jahr
    - Zufall (im mittel X %) 
    - Monatliche Entnahme-Strategien
---
Folgendes könnte noch gemacht werden, aber noch nicht notwending
- Eingabe der Kapitalertragsteuer (momentan bei 26,375 %)
- Eingabe der Teilfreistellungsquote (30% für Aktienfonds nach https://de.wikipedia.org/wiki/Investmentsteuergesetz_(Deutschland)#Besteuerung_deutscher_Anleger_in_Investmentfonds_mit_(partieller)_Kompensation_der_Steuervorbelastung )
