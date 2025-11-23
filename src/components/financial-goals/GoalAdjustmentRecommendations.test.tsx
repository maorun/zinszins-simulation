import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalAdjustmentRecommendations } from './GoalAdjustmentRecommendations'
import { type AdjustmentRecommendation } from '../../../helpers/goal-adjustments'

describe('GoalAdjustmentRecommendations', () => {
  const onTrackRecommendation: AdjustmentRecommendation = {
    type: 'on-track',
    severity: 'low',
    title: 'Auf Kurs! 🎯',
    description: 'Glückwunsch! Sie sind auf einem guten Weg, Ihr Ziel zu erreichen.',
    actionItems: ['Führen Sie Ihre regelmäßigen Sparraten fort', 'Überprüfen Sie Ihre Strategie einmal jährlich'],
    impact: 'Kontinuität führt zum Erfolg',
    priority: 0,
  }

  const increaseSavingsRecommendation: AdjustmentRecommendation = {
    type: 'increase-savings',
    severity: 'medium',
    title: 'Sparrate erhöhen',
    description: 'Um Ihr Ziel rechtzeitig zu erreichen, sollten Sie Ihre monatliche Sparrate erhöhen.',
    actionItems: [
      'Überprüfen Sie Ihr Budget auf Einsparpotenziale',
      'Automatisieren Sie die erhöhte Sparrate',
      'Nutzen Sie Gehaltserhöhungen für zusätzliche Sparraten',
    ],
    impact: 'Erhöht die Wahrscheinlichkeit, Ihr Ziel rechtzeitig zu erreichen',
    priority: 1,
  }

  const adjustTimelineRecommendation: AdjustmentRecommendation = {
    type: 'adjust-timeline',
    severity: 'high',
    title: 'Zeithorizont anpassen',
    description: 'Mit Ihrer aktuellen Strategie benötigen Sie mehr Zeit.',
    actionItems: ['Überdenken Sie, ob das ursprüngliche Zieljahr realistisch war', 'Passen Sie Ihre Lebensplanung entsprechend an'],
    impact: 'Macht Ihr Ziel mit der aktuellen Sparrate erreichbar',
    priority: 2,
  }

  const reduceCostsRecommendation: AdjustmentRecommendation = {
    type: 'reduce-costs',
    severity: 'low',
    title: 'Kosten reduzieren',
    description: 'Hohe Gebühren können Ihre Rendite schmälern.',
    actionItems: ['Wechseln Sie zu günstigen ETFs', 'Vermeiden Sie aktives Trading'],
    impact: 'Jedes eingesparte Prozent verbessert Ihre Rendite',
    priority: 5,
  }

  describe('Rendering', () => {
    it('should not render when there are no recommendations', () => {
      const { container } = render(
        <GoalAdjustmentRecommendations recommendations={[]} goalName="Test Goal" onTrack={false} />,
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render on-track recommendations', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[onTrackRecommendation, reduceCostsRecommendation]}
          goalName="Altersvorsorge"
          onTrack={true}
        />,
      )

      expect(screen.getByText(/Empfehlungen für "Altersvorsorge"/)).toBeInTheDocument()
      expect(screen.getByText(/Auf Kurs! 🎯/)).toBeInTheDocument()
      const onTrackTexts = screen.getAllByText(/auf einem guten Weg/)
      expect(onTrackTexts.length).toBeGreaterThan(0)
    })

    it('should render off-track recommendations', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation, adjustTimelineRecommendation]}
          goalName="Finanzielle Unabhängigkeit"
          onTrack={false}
        />,
      )

      expect(screen.getByText(/Anpassungsempfehlungen für "Finanzielle Unabhängigkeit"/)).toBeInTheDocument()
      expect(screen.getAllByText(/Sparrate erhöhen/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Zeithorizont anpassen/).length).toBeGreaterThan(0)
    })

    it('should display multiple recommendations', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation, adjustTimelineRecommendation, reduceCostsRecommendation]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      // Use getAllByText for text that might appear in multiple places
      expect(screen.getAllByText(/Sparrate erhöhen/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Zeithorizont anpassen/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Kosten reduzieren/).length).toBeGreaterThan(0)
    })
  })

  describe('Recommendation Content', () => {
    it('should display recommendation title and description', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      expect(screen.getByText('Sparrate erhöhen')).toBeInTheDocument()
      expect(screen.getByText(/monatliche Sparrate erhöhen/)).toBeInTheDocument()
    })

    it('should display action items', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      expect(screen.getByText(/Überprüfen Sie Ihr Budget/)).toBeInTheDocument()
      expect(screen.getByText(/Automatisieren Sie die erhöhte Sparrate/)).toBeInTheDocument()
      expect(screen.getByText(/Nutzen Sie Gehaltserhöhungen/)).toBeInTheDocument()
    })

    it('should display impact when provided', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      expect(screen.getByText(/Auswirkung:/)).toBeInTheDocument()
      expect(screen.getByText(/Erhöht die Wahrscheinlichkeit/)).toBeInTheDocument()
    })

    it('should display severity labels for non-on-track recommendations', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation, adjustTimelineRecommendation]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      expect(screen.getByText('Mittel')).toBeInTheDocument()
      expect(screen.getByText('Hoch')).toBeInTheDocument()
    })

    it('should not display severity label for on-track recommendations', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[onTrackRecommendation]}
          goalName="Test Goal"
          onTrack={true}
        />,
      )

      expect(screen.queryByText('Niedrig')).not.toBeInTheDocument()
    })
  })

  describe('Visual Indicators', () => {
    it('should show success alert for on-track status', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[onTrackRecommendation]}
          goalName="Test Goal"
          onTrack={true}
        />,
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      const successText = screen.getAllByText(/auf einem guten Weg/)
      expect(successText.length).toBeGreaterThan(0)
    })

    it('should show hint note for off-track recommendations', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      expect(screen.getByText(/Hinweis:/)).toBeInTheDocument()
      expect(screen.getByText(/basieren auf Ihrer aktuellen Situation/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render with proper semantic structure', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      // Card should be rendered
      const cards = screen.getAllByRole('heading', { level: 3 })
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should have list structure for action items', () => {
      render(
        <GoalAdjustmentRecommendations
          recommendations={[increaseSavingsRecommendation]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      const lists = screen.getAllByRole('list')
      expect(lists.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle recommendations without action items', () => {
      const noActionItemsRec: AdjustmentRecommendation = {
        type: 'on-track',
        severity: 'low',
        title: 'Test',
        description: 'Test description',
        actionItems: [],
        priority: 0,
      }

      render(
        <GoalAdjustmentRecommendations
          recommendations={[noActionItemsRec]}
          goalName="Test Goal"
          onTrack={false}
        />,
      )

      expect(screen.queryByText('Handlungsschritte:')).not.toBeInTheDocument()
    })

    it('should handle recommendations without impact', () => {
      const noImpactRec: AdjustmentRecommendation = {
        type: 'reduce-costs',
        severity: 'low',
        title: 'Test',
        description: 'Test description',
        actionItems: ['Action 1'],
        priority: 0,
      }

      render(<GoalAdjustmentRecommendations recommendations={[noImpactRec]} goalName="Test Goal" onTrack={false} />)

      expect(screen.queryByText(/Auswirkung:/)).not.toBeInTheDocument()
    })

    it('should handle all severity levels', () => {
      const allSeverities: AdjustmentRecommendation[] = [
        { ...increaseSavingsRecommendation, severity: 'low' },
        { ...increaseSavingsRecommendation, severity: 'medium' },
        { ...increaseSavingsRecommendation, severity: 'high' },
        { ...increaseSavingsRecommendation, severity: 'critical' },
      ]

      render(
        <GoalAdjustmentRecommendations recommendations={allSeverities} goalName="Test Goal" onTrack={false} />,
      )

      expect(screen.getByText('Niedrig')).toBeInTheDocument()
      expect(screen.getByText('Mittel')).toBeInTheDocument()
      expect(screen.getByText('Hoch')).toBeInTheDocument()
      expect(screen.getByText('Kritisch')).toBeInTheDocument()
    })

    it('should handle all recommendation types', () => {
      const allTypes: AdjustmentRecommendation[] = [
        { ...onTrackRecommendation, title: 'On Track' },
        { ...increaseSavingsRecommendation, title: 'Increase Savings' },
        { ...adjustTimelineRecommendation, title: 'Adjust Timeline', type: 'adjust-timeline' },
        {
          type: 'adjust-expectations',
          severity: 'high',
          title: 'Adjust Expectations',
          description: 'Test',
          actionItems: [],
          priority: 3,
        },
        {
          type: 'improve-returns',
          severity: 'medium',
          title: 'Improve Returns',
          description: 'Test',
          actionItems: [],
          priority: 4,
        },
        { ...reduceCostsRecommendation, title: 'Reduce Costs' },
      ]

      render(<GoalAdjustmentRecommendations recommendations={allTypes} goalName="Test Goal" onTrack={false} />)

      expect(screen.getByText('On Track')).toBeInTheDocument()
      expect(screen.getByText('Increase Savings')).toBeInTheDocument()
      expect(screen.getByText('Adjust Timeline')).toBeInTheDocument()
      expect(screen.getByText('Adjust Expectations')).toBeInTheDocument()
      expect(screen.getByText('Improve Returns')).toBeInTheDocument()
      expect(screen.getByText('Reduce Costs')).toBeInTheDocument()
    })
  })
})
