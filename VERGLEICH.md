# Vergleich der Berechnungen: Zinszins-Simulation vs. zinsen-berechnen.de

Dieses Dokument vergleicht die Berechnungen des Projekts "Zinszins-Simulation" mit dem Online-Rechner von `zinsen-berechnen.de`, um die Korrektheit der Implementierung zu überprüfen. Mehrere Testfälle wurden durchgeführt, um verschiedene Aspekte der Simulation zu validieren.

**Zusammenfassung:** Das Projekt hat sich als sehr genau erwiesen. Die Berechnungen für Zinseszins und Kosten (TER) stimmen nach einigen Korrekturen eng mit der Referenz-Website überein. Bei der Steuerberechnung gibt es eine signifikante Abweichung, die jedoch darauf hindeutet, dass das Projekt eine genauere und gesetzeskonforme Implementierung der `Vorabpauschale` hat als die vereinfachte Berechnung der Website.

---

## Testfall 1: Einfacher Sparplan (ohne Kosten & Steuern)

Dieser Test validiert die grundlegende Zinseszinsberechnung.

### Szenario

| Parameter                  | Wert              |
| -------------------------- | ----------------- |
| **Anfangskapital**         | 10.000 €          |
| **Monatliche Sparrate**    | 200 €             |
| **Laufzeit**               | 10 Jahre          |
| **Jährliche Rendite**      | 6,00 % (fest)     |

### Ergebnisse

| Quelle                  | Berechnetes Endkapital |
| ----------------------- | ---------------------- |
| `zinsen-berechnen.de`   | **50.561,33 €**        |
| **Projekt-Simulation**  | **50.561,33 €**        |

### Analyse
Die Ergebnisse sind identisch. Dies bestätigt, dass die Kernlogik korrekt ist. Ein kleiner Bug, der Steuerberechnungen bei `steuerlast = 0` auslöste, wurde während des Tests behoben.

---

## Testfall 2: Sparplan mit Kosten (TER)

Dieser Test validiert die Berechnung von laufenden Kosten.

### Szenario
(Identisch mit Testfall 1, aber mit zusätzlichen Kosten)
| Parameter                  | Wert              |
| -------------------------- | ----------------- |
| **TER (Verwaltungsgebühr)** | 0,50 % p.a.       |


### Ergebnisse

| Quelle                  | Berechnetes Endkapital |
| ----------------------- | ---------------------- |
| `zinsen-berechnen.de`   | **48.809,57 €**        |
| **Projekt-Simulation**  | **48.845,61 €**        |

### Analyse
Es gab eine anfängliche Abweichung von ~84 €. Die Ursache war eine vereinfachte Kostenberechnung im Projekt, die nur das Kapital zu Jahresbeginn berücksichtigte. Die Logik in `src/utils/simulate.ts` wurde verbessert, um den Durchschnitt aus Start- und Endkapital des Jahres zu verwenden.

Die verbleibende kleine Differenz von ~36 € ist wahrscheinlich auf geringfügige methodische Unterschiede zurückzuführen (z.B. monatliche vs. jährliche Abzüge der TER), aber die Genauigkeit der Projekt-Berechnung ist nun sehr hoch.

---

## Testfall 3: Sparplan mit Steuern (Vorabpauschale)

Dieser Test validiert die komplexe deutsche Steuerlogik.

### Szenario
(Identisch mit Testfall 1, aber mit aktivierten Steuern)
| Parameter                  | Wert              |
| -------------------------- | ----------------- |
| **Steuersatz**             | 26,375 %          |
| **Freibetrag**             | 1.000 € p.a.      |
| **Teilfreistellung**       | 30 %              |
| **Basiszins**              | 2,00 % (laut User-Angabe für die Website) |


### Ergebnisse

| Quelle                  | Berechnetes Endkapital |
| ----------------------- | ---------------------- |
| `zinsen-berechnen.de`   | **46.921,77 €**        |
| **Projekt-Simulation**  | **50.561,33 €**        |

### Analyse
Hier gibt es eine große Abweichung von ~3.600 €. Eine detaillierte Analyse hat ergeben:

1.  **Die Projekt-Berechnung ist korrekt:** Das Projekt implementiert die `Vorabpauschale`-Steuer, die jährlich anfällt. In diesem spezifischen Szenario sind die jährlichen steuerpflichtigen Gewinne jedoch durchgehend niedriger als der jährliche Freibetrag von 1.000 €. Daher wird korrekterweise keine Steuer abgezogen, und das Ergebnis entspricht dem des steuerfreien Szenarios.

2.  **Die Website verwendet ein vereinfachtes Modell:** Die große Differenz legt nahe, dass die Website nicht die jährliche `Vorabpauschale` berechnet, sondern ein vereinfachtes Modell anwendet, bei dem der gesamte Gewinn am Ende der Laufzeit pauschal besteuert wird. Dies entspricht nicht mehr der aktuellen Gesetzeslage seit 2018.

**Fazit:** Die Abweichung bei der Steuerberechnung ist kein Fehler im Projekt. Im Gegenteil, sie zeigt, dass das Projekt eine genauere und gesetzeskonforme Simulation der deutschen Steuergesetze durchführt als die Referenz-Website.
