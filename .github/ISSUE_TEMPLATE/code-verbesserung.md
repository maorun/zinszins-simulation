---
name: code-verbesserung
about: Code-Verbesserung ohne Feature-Änderungen
title: Code-Verbesserung
labels: Copilot, code-quality
assignees: 'Copilot'
---

## 📋 Aufgabenbeschreibung

Verbessere die Code-Qualität ohne neue Features hinzuzufügen oder bestehende Features zu entfernen. Konzentriere dich auf Refactoring, Code-Organisation, Performance-Optimierungen, und Best-Practice-Implementierung.

## 🎯 Zu befolgende Schritte

### 1. Vorbereitung und Analyse

- **Lies die komplette `.github/copilot-instructions.md`** - ALLE Richtlinien, Best Practices und Workflow-Anforderungen müssen vollständig berücksichtigt werden
- **Installiere Dependencies**: `npm install` (KRITISCH - muss als erstes ausgeführt werden in einem frischen Clone)
- **Etabliere Baseline**: Führe `npm run test`, `npm run lint`, und `npm run build` aus um den aktuellen Zustand zu verstehen
- **Analysiere den Code**: Identifiziere Verbesserungsmöglichkeiten:
  - Code-Duplikation und Wiederholungen
  - Komponenten über 500-800 Zeilen (Refactoring-Kandidaten)
  - Komplexe Funktionen die vereinfacht werden können
  - TypeScript-Typen die verbessert werden können
  - Performance-Bottlenecks
  - ESLint/TypeScript-Warnungen die behoben werden können
  - Code-Kommentare die aktualisiert werden müssen
  - Veraltete Patterns oder Antipatterns

### 2. Planung und Reporting

- **Erstelle einen detaillierten Plan** mit `report_progress` als Checkliste mit 3-8 Teilschritten
- **Orientiere dich an**: Step-by-Step Development Approach (Teilschritt commits) aus copilot-instructions.md
- **Jeder Schritt sollte sein**: Fokussiert, unabhängig testbar, minimal invasiv
- **Priorisiere Verbesserungen** nach Impact und Risiko

### 3. Implementierung (Für jeden Teilschritt)

**Development Phase:**

- Implementiere **nur einen fokussierten Improvement** pro Schritt
- Minimale, chirurgische Änderungen
- **KEINE funktionalen Änderungen** - Verhalten muss identisch bleiben
- Folge bestehenden Code-Patterns und architektonischen Entscheidungen
- Aktualisiere Dokumentation nur wenn Code-Strukturen sich ändern

**Testing & Linting Phase - VERPFLICHTEND:**

- **npm install** muss ausgeführt worden sein (check for `node_modules/`)
- **KEINE AUSNAHMEN**: Für **jede Code-Änderung** müssen Tests angepasst oder erweitert werden falls nötig
- **npm run test** - Alle Tests müssen weiterhin bestehen (2519+ tests across 297 files)
- **npm run lint** - Muss mit 0 Warnings bestehen
- **npm run typecheck** - Erwarte minimale oder keine Fehler
- **npm run build** - Muss erfolgreich abschließen
- **Bei Fehlern**: Zurück zur Development Phase

**Individual Step Commit:**

- **Nutze `report_progress`** nach jedem abgeschlossenen Teilschritt
- **Update die Checklist** - Markiere den aktuellen Schritt als erledigt
- **Klare Commit Message** - Beschreibe die spezifische Verbesserung
- **Review committed files** - Stelle sicher nur relevante Änderungen committed werden

**Step Validation:**

- **Regression Testing**: Verifiziere dass KEINE Funktionalität geändert wurde
- **Manual Testing**: Teste die App manuell um sicherzustellen alles funktioniert wie vorher
- **Browser Console**: Prüfe auf neue Fehler (ignore Vercel Analytics warnings)
- **Performance Check**: Bei Performance-Optimierungen, messe den Unterschied

### 4. Final Review

- **Code Review durchführen** gemäß Code Review Guidelines in copilot-instructions.md
- **Comprehensive Manual Validation**: Kompletten User-Workflow testen (siehe copilot-instructions.md)
- **npm run dev**: Applikation starten und Features manuell validieren
- **Verify alle Features** funktionieren exakt wie vorher
- **Keine neuen Features**: Bestätige dass keine neuen Funktionalitäten hinzugefügt wurden
- **Keine entfernten Features**: Bestätige dass keine Funktionalitäten entfernt wurden

## ⚠️ Kritische Anforderungen

### Code-Verbesserung Prinzipien

- **Funktionales Verhalten beibehalten** - KEINE Änderungen am Verhalten der Applikation
- **Alle Tests müssen bestehen** - Keine Test-Änderungen außer bei Refactoring-bedingten Anpassungen
- **Rückwärtskompatibilität** - Keine Breaking Changes
- **Schrittweises Vorgehen** - Kleine, fokussierte Verbesserungen

### Testing - VERPFLICHTEND

- **Test Coverage beibehalten oder verbessern** - Keine Reduktion der Test-Abdeckung
- Alle bestehenden Tests müssen weiterhin bestehen
- Bei strukturellen Änderungen: Tests entsprechend anpassen
- Neue Tests nur falls bestehende Tests unzureichend sind

### Code Quality

- **KEINE eslint-disable Kommentare** - Fixe das zugrunde liegende Problem
- **Nur Tailwind CSS utility classes** - Keine custom CSS classes oder separate CSS files
- **shadcn/ui components** für UI-Code - Keine UI-Framework-Mixe
- **HTML ID Management**: Nutze unique-id.ts utilities für eindeutige IDs

### Development Workflow

- **Step-by-step commits (Teilschritt commits)** - Jede Verbesserung wird individuell committed
- **report_progress nach jedem Schritt** - Fortschritt regelmäßig dokumentieren
- **Minimale Änderungen** - Chirurgisch präzise, fokussierte Changes

## 🎯 Verbesserungsbereiche (Beispiele)

### Component Refactoring

- Komponenten über 500-800 Zeilen in kleinere, fokussierte Komponenten aufteilen
- Display-Logik von Konfigurations-Logik trennen
- Business-Logik in Custom Hooks extrahieren
- Utility-Funktionen in separate Dateien auslagern
- Siehe "Component Refactoring Best Practices" in copilot-instructions.md

### Code-Organisation

- Duplizierten Code in wiederverwendbare Funktionen extrahieren
- Verwandte Funktionen gruppieren
- Import-Statements organisieren und optimieren
- Datei- und Ordnerstruktur verbessern

### TypeScript Verbesserungen

- `any` Types durch spezifische Types ersetzen
- Type-Inference verbessern
- Gemeinsame Types in type-Definitionen auslagern
- Union Types und Discriminated Unions nutzen

### Performance-Optimierungen

- Unnötige Re-Renders vermeiden (useMemo, useCallback)
- Berechnungen optimieren
- Bundle-Größe reduzieren
- Lazy Loading wo sinnvoll

### Code-Stil und Lesbarkeit

- Konsistente Namenskonventionen
- Verbesserte Kommentare für komplexe Logik
- Magic Numbers durch benannte Konstanten ersetzen
- Lange Funktionen in kleinere, benannte Funktionen aufteilen

### Testing Verbesserungen

- Test-Duplikation reduzieren
- Test-Utilities für gemeinsame Patterns erstellen
- Test-Beschreibungen verbessern
- Edge-Cases abdecken

## 📚 Referenzen

- **Vollständiger Workflow**: Siehe `.github/copilot-instructions.md` (VOLLSTÄNDIG LESEN)
- **Component Refactoring Best Practices**: Detaillierter Abschnitt in copilot-instructions.md
- **Development Patterns**: State Management, HTML ID Management (unique-id.ts)
- **UI Framework**: shadcn/ui components (MIGRATION COMPLETE)
- **Testing Guidelines**: Comprehensive test coverage, integration tests
- **Code Review Guidelines**: Detaillierte Checkliste in copilot-instructions.md

## 🎓 Wichtige Entwicklungsprinzipien

1. **Keine funktionalen Änderungen** - Nur Code-Qualitäts-Verbesserungen
2. **Test-Coverage beibehalten** - Alle Tests müssen weiterhin bestehen
3. **Schrittweise Verbesserungen** - Kleine, fokussierte Refactorings
4. **Dokumentation aktualisieren** - Bei strukturellen Änderungen
5. **Performance messen** - Bei Performance-Optimierungen Vorher/Nachher dokumentieren

## ⚡ Verbesserungsstrategien

### Identifizierung von Verbesserungsmöglichkeiten

- Führe `npm run lint` aus und behebe alle Warnungen
- Prüfe `npm run typecheck` auf Type-Verbesserungen
- Suche nach großen Komponenten (&gt; 500 Zeilen): `find src -name "*.tsx" -exec wc -l {} + | sort -rn | head -10`
- Identifiziere duplizierte Code-Patterns
- Analysiere Bundle-Größe und identifiziere Optimierungspotential

### Priorisierung

1. **High Impact, Low Risk**: TypeScript-Verbesserungen, ESLint-Fixes
2. **Medium Impact, Medium Risk**: Component Refactoring, Code-Organisation
3. **High Impact, Higher Risk**: Performance-Optimierungen, größere Refactorings

### Best Practices

- **Eine Verbesserung nach der anderen** - Nicht mehrere Refactorings parallel
- **Tests zuerst validieren** - Stelle sicher alle Tests vor der Änderung bestehen
- **Kleine Schritte** - Lieber 5 kleine Commits als 1 großer
- **Manuelle Validierung** - Teste die App nach jeder Änderung
- **Rollback-fähig** - Jeder Commit sollte unabhängig rollbar sein

## 🔍 Erfolgs-Kriterien

Nach erfolgreicher Code-Verbesserung sollte gelten:

- ✅ Alle Tests bestehen (`npm run test`)
- ✅ Linting ist fehlerfrei (`npm run lint`)
- ✅ Build funktioniert (`npm run build`)
- ✅ TypeScript-Fehler sind reduziert oder eliminiert
- ✅ Manuelle Tests zeigen identisches Verhalten
- ✅ Code ist lesbarer und wartbarer
- ✅ Keine neuen Features wurden hinzugefügt
- ✅ Keine bestehenden Features wurden entfernt
- ✅ Dokumentation ist aktuell (falls strukturelle Änderungen)
