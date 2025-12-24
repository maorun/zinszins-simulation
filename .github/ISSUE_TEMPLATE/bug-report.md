---
name: bug-report
about: Bug Fix für Copilot
title: 'Bug: '
labels: Copilot, bug
assignees: 'Copilot'
---

## 📋 Aufgabenbeschreibung

Behebe den im Issue-Titel und der Issue-Beschreibung beschriebenen Bug und folge dabei dem vollständigen Entwicklungsworkflow aus der `copilot-instructions.md`.

## 🎯 Zu befolgende Schritte

### 1. Vorbereitung und Analyse

- **Lies die komplette `.github/copilot-instructions.md`** - ALLE Richtlinien, Best Practices und Workflow-Anforderungen müssen vollständig berücksichtigt werden
- **Installiere Dependencies**: `npm install` (KRITISCH - muss als erstes ausgeführt werden in einem frischen Clone)
- **Etabliere Baseline**: Führe `npm run test`, `npm run lint`, und `npm run build` aus um den aktuellen Zustand zu verstehen
- **Analysiere den Bug**: Verstehe die Bug-Beschreibung aus dem Issue-Titel und der Issue-Beschreibung
  - Reproduziere den Bug falls Reproduktionsschritte angegeben sind
  - Verwende `npm run dev` und teste manuell im Browser
  - Prüfe Browser-Console auf Fehler
  - Nutze Tests zur Isolation des Problems
  - Identifiziere die Root-Cause und betroffene Dateien

### 2. Planung und Reporting

- **Erstelle einen detaillierten Plan** mit `report_progress` als Checkliste mit 3-8 Teilschritten
- **Orientiere dich an**: Step-by-Step Development Approach (Teilschritt commits) aus copilot-instructions.md
- **Jeder Schritt sollte sein**: Fokussiert, unabhängig testbar, minimal invasiv
- **Fokus auf minimale Änderungen**: Nur den Bug fixen, keine Feature-Änderungen

### 3. Implementierung (Für jeden Teilschritt)

**Development Phase:**

- Implementiere **nur einen fokussierten Fix** pro Schritt
- **Minimale, chirurgische Änderungen** - Nur was absolut notwendig ist
- **KEINE funktionalen Änderungen** die nicht direkt mit dem Bug zusammenhängen
- Folge bestehenden Code-Patterns und architektonischen Entscheidungen
- Aktualisiere Dokumentation nur wenn der Bug die Dokumentation betrifft

**Testing & Linting Phase - VERPFLICHTEND:**

- **npm install** muss ausgeführt worden sein (check for `node_modules/`)
- **KEINE AUSNAHMEN**: Für **jeden Bug-Fix** müssen entsprechende Tests hinzugefügt oder angepasst werden
  - **Regressions-Test hinzufügen**: Erstelle einen Test der den Bug reproduziert und verifiziert dass er gefixt ist
  - **Bestehende Tests anpassen**: Falls der Fix bestehende Tests betrifft
- **npm run test** - Alle Tests müssen bestehen (2519+ tests across 297 files)
- **npm run lint** - Muss mit 0 Warnings bestehen
- **npm run typecheck** - Erwarte minimale oder keine Fehler
- **npm run build** - Muss erfolgreich abschließen
- **Bei Fehlern**: Zurück zur Development Phase

**Individual Step Commit:**

- **Nutze `report_progress`** nach jedem abgeschlossenen Teilschritt
- **Update die Checklist** - Markiere den aktuellen Schritt als erledigt
- **Klare Commit Message** - Beschreibe die spezifische Änderung
- **Review committed files** - Stelle sicher nur relevante Änderungen committed werden

**Step Validation:**

- **Bug-Reproduktion testen**: Verifiziere dass der Bug nicht mehr auftritt
- **Regression Testing**: Stelle sicher keine neuen Bugs eingeführt wurden
- **Manual Testing**: Teste die App manuell um sicherzustellen alles funktioniert
- **Browser Console**: Prüfe auf neue Fehler (ignore Vercel Analytics warnings)
- **Screenshots**: Bei UI-bezogenen Bugs - vorher/nachher Screenshots machen

### 4. Final Review

- **Code Review durchführen** gemäß Code Review Guidelines in copilot-instructions.md
- **Comprehensive Manual Validation**: Kompletten User-Workflow testen (siehe copilot-instructions.md)
- **npm run dev**: Applikation starten und Bug-Fix manuell validieren
- **Verify der Fix**: Stelle sicher der Bug ist wirklich gefixt
- **Verify keine Regressions**: Stelle sicher keine neuen Probleme eingeführt wurden
- **Edge Cases testen**: Teste verschiedene Szenarien und Randfälle

## ⚠️ Kritische Anforderungen

### Bug-Fix Prinzipien

- **Minimale Änderungen** - Nur was nötig ist um den Bug zu fixen
- **Root-Cause beheben** - Nicht nur Symptome behandeln
- **Keine neuen Features** - Fokus ausschließlich auf den Bug-Fix
- **Rückwärtskompatibilität** - Keine Breaking Changes
- **Regressions-Test**: Füge einen Test hinzu der den Bug reproduziert und den Fix verifiziert

### Testing - VERPFLICHTEND

- **Regressions-Test hinzufügen** - MUSS für jeden Bug-Fix erstellt werden
- **Test Coverage beibehalten** - Keine Reduktion der Test-Abdeckung
- Alle bestehenden Tests müssen weiterhin bestehen
- Der neue Test sollte OHNE den Fix fehlschlagen und MIT dem Fix bestehen

### Code Quality

- **KEINE eslint-disable Kommentare** - Fixe das zugrunde liegende Problem
- **Nur Tailwind CSS utility classes** - Keine custom CSS classes oder separate CSS files
- **shadcn/ui components** für UI-Code - Keine UI-Framework-Mixe
- **HTML ID Management**: Nutze unique-id.ts utilities für eindeutige IDs

### Development Workflow

- **Step-by-step commits (Teilschritt commits)** - Jeder Fix-Schritt wird individuell committed
- **report_progress nach jedem Schritt** - Fortschritt regelmäßig dokumentieren
- **Minimale Änderungen** - Chirurgisch präzise, fokussierte Changes

## 🔍 Bug-Kategorien (zur Orientierung)

### UI/UX Bugs

- Darstellungsfehler
- Responsiveness-Probleme
- Falsche Formatierung (z.B. Währung, Prozente)
- Fehlende oder falsche Labels

### Berechnungs-Bugs

- Falsche Steuerberechnungen (Vorabpauschale, Freibetrag, etc.)
- Fehlerhafte Zinseszins-Berechnungen
- Inkorrekte Entnahme-Strategien
- Monte Carlo Simulationsfehler

### Performance-Bugs

- Langsame Berechnungen
- Unnötige Re-Renders
- Speicherlecks
- Freezing der UI

### Data-Bugs

- Falsche Daten-Persistierung
- Export-Fehler (CSV, Markdown)
- Import-Probleme
- Inkonsistente Daten-Zustände

### TypeScript/Type-Bugs

- Type-Errors
- Unhandled Null/Undefined
- Type-Coercion Probleme

### Integration-Bugs

- Probleme zwischen Komponenten
- State-Management Issues
- Props-Passing Fehler

## 📚 Referenzen

- **Vollständiger Workflow**: Siehe `.github/copilot-instructions.md` (VOLLSTÄNDIG LESEN)
- **Development Patterns**: State Management, HTML ID Management (unique-id.ts)
- **UI Framework**: shadcn/ui components (MIGRATION COMPLETE)
- **German Financial Features**: Vorabpauschale, Freibetrag, Kapitalertragsteuer
- **Testing Guidelines**: Comprehensive test coverage, integration tests
- **Code Review Guidelines**: Detaillierte Checkliste in copilot-instructions.md

## 🎓 Wichtige Bug-Fix Prinzipien

1. **Root-Cause finden** - Nicht nur Symptome behandeln
2. **Minimale Änderungen** - Nur das Nötigste ändern
3. **Regressions-Test schreiben** - MUSS für jeden Bug erstellt werden
4. **Keine Side-Effects** - Keine unbeabsichtigten Änderungen
5. **Edge Cases bedenken** - Den Fix für verschiedene Szenarien testen

## ✅ Erfolgs-Kriterien

Nach erfolgreichem Bug-Fix sollte gelten:

- ✅ Bug ist reproduzierbar gefixt (kann nicht mehr reproduziert werden)
- ✅ Regressions-Test wurde hinzugefügt und besteht
- ✅ Alle Tests bestehen (`npm run test`)
- ✅ Linting ist fehlerfrei (`npm run lint`)
- ✅ Build funktioniert (`npm run build`)
- ✅ TypeScript-Fehler sind nicht erhöht
- ✅ Manuelle Tests zeigen korrektes Verhalten
- ✅ Keine neuen Bugs wurden eingeführt
- ✅ Screenshots zeigen das behobene Problem (bei UI-Bugs)
- ✅ Edge Cases wurden getestet
- ✅ Dokumentation ist aktuell (falls relevant)

## 🔄 Wenn der Bug nicht reproduzierbar ist

Falls du den Bug nicht reproduzieren kannst:

1. **Dokumentiere deine Versuche** - Was hast du ausprobiert?
2. **Frage nach mehr Informationen** - Welche Details fehlen?
3. **Prüfe ob der Bug bereits gefixt ist** - Vielleicht wurde er bereits behoben?
4. **Teste verschiedene Umgebungen** - Browser, Betriebssystem, etc.
5. **Schließe das Issue mit Erklärung** - Dokumentiere warum nicht reproduzierbar
