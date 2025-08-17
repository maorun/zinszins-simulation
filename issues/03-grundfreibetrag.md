### Feature: Berücksichtigung des Grundfreibetrages bei der Entnahme

**Beschreibung:**
Während der Entnahmephase können Kapitalerträge, die den Sparerpauschbetrag übersteigen, steuerpflichtig sein. Für Personen ohne weiteres Einkommen (z.B. Rentner) sollte bei der Steuerberechnung der Einkommensteuer-Grundfreibetrag berücksichtigt werden können. Dieses Feature ist laut `README.md` geplant und im Code von `HomePage.tsx` als Kommentar vermerkt.

**Anforderungen:**
1.  **Logik-Implementierung:** Die Berechnungslogik der Entnahmephase muss um die Berücksichtigung des Grundfreibetrags erweitert werden. Kapitalerträge sollten erst nach Ausschöpfung des Sparerpauschbetrags und anschließend des Grundfreibetrags besteuert werden.
2.  **UI-Option:** Der Nutzer sollte eine Option haben (z.B. Checkbox "Grundfreibetrag berücksichtigen"), um diese Berechnung zu aktivieren.
3.  **Konfigurierbarkeit:** Es sollte eine Möglichkeit geben, die Höhe des Grundfreibetrags pro Jahr zu konfigurieren, ähnlich wie es bereits für den Sparerpauschbetrag umgesetzt ist.
4.  **Transparente Darstellung:** In der Ergebnisansicht muss klar ersichtlich sein, wie der Grundfreibetrag die Steuerlast reduziert hat.

---
*copilot soll sich an die copilot-instructions.md halten.*
