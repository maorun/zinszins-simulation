### Feature: Monatliche Entnahme-Strategien

**Beschreibung:**
Aktuell unterstützt die Simulation der Entnahmephase nur jährliche Entnahmeraten (z.B. die 4%-Regel). Laut `README.md` ist die Erweiterung um monatliche Strategien geplant. Dieses Ticket beschreibt die Implementierung dieser Funktionalität.

**Anforderungen:**
1.  **UI-Erweiterung:** In der "Entnahme"-Sektion muss eine Option (z.B. Radio-Buttons) hinzugefügt werden, mit der der Nutzer zwischen "jährlicher" und "monatlicher" Entnahme wählen kann.
2.  **Logik-Anpassung:** Die Simulations-Logik für die Entnahmephase muss so angepasst werden, dass sie monatliche Entnahmen korrekt berechnet. Dies beinhaltet die anteilige Berechnung von Rendite und Steuern auf monatlicher Basis.
3.  **Anzeige der Ergebnisse:** Die Ausgabetabelle der Entnahmesimulation sollte in der Lage sein, eine monatliche Aufschlüsselung darzustellen, wenn diese Option gewählt ist.

---
*copilot soll sich an die copilot-instructions.md halten.*
