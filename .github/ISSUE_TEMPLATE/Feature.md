---
name: feature
about: Feature für copilot
title: Feature aus der features.md
labels: Copilot
assignees: 'Copilot'
---

## 📋 Aufgabenbeschreibung

Implementiere ein vielversprechendes Feature aus der `FEATURES.md` und folge dabei dem vollständigen Entwicklungsworkflow aus der `copilot-instructions.md`.

## 🎯 Zu befolgende Schritte

### 1. Vorbereitung und Analyse

- **Lies die komplette `copilot-instructions.md`** - Alle Richtlinien, Best Practices und Workflow-Anforderungen müssen berücksichtigt werden
- **Analysiere `FEATURES.md`** - Identifiziere das vielversprechendste, am besten geeignete Feature
- **Falls FEATURES.md leer ist**: Füge mindestens 3-5 neue, innovative Feature-Ideen zur `FEATURES.md` hinzu, bevor du fortfährst
- **Installiere Dependencies**: `npm install` (KRITISCH - muss als erstes ausgeführt werden in einem frischen Clone)

### 2. Planung und Reporting

- **Erstelle einen detaillierten Plan** mit `report_progress` als Checkliste mit 3-8 Teilschritten
- **Orientiere dich an**: Step-by-Step Development Approach (Teilschritt commits) aus copilot-instructions.md
- **Jeder Schritt sollte sein**: Fokussiert, unabhängig testbar, minimal invasiv

### 3. Implementierung (Für jeden Teilschritt)

**Development Phase:**

- Implementiere **nur einen fokussierten Change** pro Schritt
- Minimale, chirurgische Änderungen
- Folge bestehenden Code-Patterns und architektonischen Entscheidungen
- Aktualisiere Dokumentation (README.md) bei neuen user-facing Features

**Testing & Linting Phase - VERPFLICHTEND:**

- **npm install** muss ausgeführt worden sein (check for `node_modules/`)
- **KEINE AUSNAHMEN**: Für **jeden Change oder Addition** eines Features **müssen** entsprechende Tests hinzugefügt oder angepasst werden
- **npm run test** - Alle Tests müssen bestehen (2519+ tests across 297 files)
- **npm run lint** - Muss mit 0 Warnings bestehen
- **npm run typecheck** - Erwarte minimale Fehler
- **npm run build** - Muss erfolgreich abschließen
- **Bei Fehlern**: Zurück zur Development Phase

**Individual Step Commit:**

- **Nutze `report_progress`** nach jedem abgeschlossenen Teilschritt
- **Update die Checklist** - Markiere den aktuellen Schritt als erledigt
- **Klare Commit Message** - Beschreibe was in diesem Schritt erreicht wurde
- **Review committed files** - Stelle sicher nur relevante Änderungen committed werden

**Step Validation:**

- **Manual Testing**: Verifiziere die spezifische Funktionalität
- **Integration Testing**: Stelle sicher nichts kaputt geht
- **Browser Console**: Prüfe auf neue Fehler (ignore Vercel Analytics warnings)
- **Screenshots**: Bei UI-Änderungen

### 4. Nach erfolgreicher Implementierung

- **Entferne das implementierte Feature** aus `FEATURES.md`
- **NICHT erwähnen**, dass es implementiert wurde (verwende KEINE Marker wie ~~durchgestrichen~~ oder ✅)
- **Einfach löschen** - Die Feature-Beschreibung komplett aus der Datei entfernen
- **Commit die Änderung** in `FEATURES.md` mit `report_progress`

### 5. Final Review

- **Code Review durchführen** gemäß Code Review Guidelines in copilot-instructions.md
- **Comprehensive Manual Validation**: Kompletten User-Workflow testen (siehe copilot-instructions.md)
- **npm run dev**: Applikation starten und Features manuell validieren
- **Verify alle interaktiven Features** funktionieren korrekt

## ⚠️ Kritische Anforderungen

### Testing - VERPFLICHTEND

- **Test Coverage ist NICHT optional** - Es ist eine zwingende Anforderung
- Für jede Code-Änderung müssen entsprechende Tests erstellt oder angepasst werden
- Alle Tests müssen bestehen bevor der nächste Schritt beginnt

### Code Quality

- **KEINE eslint-disable Kommentare** - Fixe das zugrunde liegende Problem
- **Nur Tailwind CSS utility classes** - Keine custom CSS classes oder separate CSS files
- **shadcn/ui components** für neue UI-Entwicklung - Keine UI-Framework-Mixe

### Development Workflow

- **Step-by-step commits (Teilschritt commits)** - Jeder Schritt wird individuell committed
- **report_progress nach jedem Schritt** - Fortschritt regelmäßig dokumentieren
- **Minimale Änderungen** - Chirurgisch präzise, fokussierte Changes

## 📚 Referenzen

- **Vollständiger Workflow**: Siehe `.github/copilot-instructions.md`
- **Development Patterns**: State Management, HTML ID Management (unique-id.ts)
- **UI Framework**: shadcn/ui components (MIGRATION COMPLETE)
- **German Financial Features**: Vorabpauschale, Freibetrag, Kapitalertragsteuer
- **Testing Guidelines**: Comprehensive test coverage, integration tests

## 🎓 Wichtige Entwicklungsprinzipien

1. **Deutsche Gesetzeskonformität** - Alle steuerlichen Features korrekt abbilden
2. **Echtzeit-Berechnungen** - Sofortige Updates ermöglichen
3. **Test-Coverage** - Minimum 90% für neue Funktionalitäten
4. **Mobile-First** - Responsive Design für alle neuen UI-Komponenten
5. **Accessibility** - shadcn/ui Standards für Barrierefreiheit einhalten

## 🔄 Wenn FEATURES.md leer ist

**WICHTIG**: Falls keine Features mehr in `FEATURES.md` vorhanden sind:

1. **Füge mindestens 3-5 neue, innovative Feature-Ideen hinzu** bevor du fortfährst
2. **Orientiere dich an**:
   - Bestehenden Feature-Kategorien in FEATURES.md
   - Aktuellen Trends in deutscher Finanzplanung
   - Verbesserungen der User Experience
   - Erweiterte Analyse-Möglichkeiten
3. **Strukturiere neue Features** nach:
   - Kategorie (z.B. Erweiterte Finanzplanung, Risikomanagement, etc.)
   - Beschreibung der Funktionalität
   - Priorisierung (Hoch ⭐⭐⭐, Mittel ⭐⭐, Niedrig ⭐)
4. **Commit die neuen Feature-Ideen** mit `report_progress` bevor du mit der Implementierung beginnst
