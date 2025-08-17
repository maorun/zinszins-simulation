### Feature: Dedizierte UI für Einmalzahlungen

**Beschreibung:**
Die `README.md` listet "Einmalzahlungen" als bereits umgesetzt. In der Benutzeroberfläche fehlt jedoch eine klare und intuitive Eingabemöglichkeit hierfür. Aktuell muss der Nutzer dies über die "Sparplan"-Funktion abbilden, was nicht benutzerfreundlich ist. Dieses Ticket zielt darauf ab, eine dedizierte UI-Komponente für Einmalzahlungen zu schaffen.

**Anforderungen:**
1.  **Neue UI-Komponente:** Es soll ein neuer, separater Bereich (z.B. ein eigener `Panel` neben "Sparpläne erstellen") für "Einmalzahlungen" geschaffen werden.
2.  **Eingabefelder:** In diesem Bereich soll der Nutzer eine oder mehrere Einmalzahlungen mit Betrag und Datum (Jahr/Monat) definieren können.
3.  **Integration:** Die eingegebenen Einmalzahlungen müssen korrekt an die Simulationslogik übergeben und im Berechnungsablauf berücksichtigt werden.
4.  **Verwaltung:** Ähnlich wie bei den Sparplänen sollte der Nutzer hinzugefügte Einmalzahlungen sehen und wieder löschen können.

---
*copilot soll sich an die copilot-instructions.md halten.*
