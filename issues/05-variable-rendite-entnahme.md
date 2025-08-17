### Feature: Variable Renditen in der Entnahmephase

**Beschreibung:**
Die Anwendung erlaubt bereits die Konfiguration von variablen, jahrgenauen Renditen für die Ansparphase. Diese Konfigurationsmöglichkeit fehlt jedoch für die Entnahmephase, welche für eine realistische Simulation entscheidend ist. Die `README.md` listet dies als geplante Erweiterung.

**Anforderungen:**
1.  **UI in der Entnahme-Sektion:** In der `Entnahme`-UI-Sektion muss eine Möglichkeit geschaffen werden, variable Renditen für die Jahre der Entnahme zu definieren. Dies könnte ein ähnlicher Editor sein wie der, der bereits für die Ansparphase existiert.
2.  **Separate Konfiguration:** Die Renditen für die Entnahmephase sollten unabhängig von denen der Ansparphase konfiguriert werden können, um unterschiedliche Marktbedingungen (z.B. ein konservativeres Portfolio in der Rente) abbilden zu können.
3.  **Logik-Anpassung:** Die Simulationslogik der Entnahme muss diese spezifischen variablen Renditen anstelle einer festen Rate verwenden.
4.  **Visualisierung:** Die Auswirkungen der variablen Renditen müssen in der Entnahmesimulation klar ersichtlich sein.

---
*copilot soll sich an die copilot-instructions.md halten.*
