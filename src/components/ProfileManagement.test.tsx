import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import ProfileManagement from './ProfileManagement'
import { SimulationProvider } from '../contexts/SimulationContext'
import * as profileStorage from '../utils/profile-storage'
import { toast } from 'sonner'

// Mock the profile storage module
vi.mock('../utils/profile-storage', () => ({
  getAllProfiles: vi.fn(),
  getActiveProfile: vi.fn(),
  setActiveProfile: vi.fn(),
  createProfile: vi.fn(),
  updateProfile: vi.fn(),
  deleteProfile: vi.fn(),
  duplicateProfile: vi.fn(),
  clearAllProfiles: vi.fn(),
  hasProfiles: vi.fn(),
  getProfileCount: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock confirm dialog
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SimulationProvider>{children}</SimulationProvider>
)

// Test configuration
const mockConfiguration = {
  rendite: 5,
  steuerlast: 26.375,
  teilfreistellungsquote: 30,
  freibetragPerYear: { 2024: 1000, 2025: 1000 },
  returnMode: 'fixed' as const,
  averageReturn: 5,
  standardDeviation: 15,
  variableReturns: {},
  startEnd: [2024, 2040] as [number, number],
  sparplan: [],
  simulationAnnual: 'monthly' as const,
}

// Test data
const mockProfiles = [
  {
    id: 'default',
    name: 'Standard Profil',
    description: 'Automatisch erstelltes Standardprofil',
    configuration: mockConfiguration,
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
  },
  {
    id: 'profile1',
    name: 'Familie Müller',
    description: 'Sparplan für die Familie',
    configuration: mockConfiguration,
    createdAt: '2024-01-02T10:00:00.000Z',
    updatedAt: '2024-01-02T10:00:00.000Z',
  },
  {
    id: 'profile2',
    name: 'Test Szenario',
    description: undefined,
    configuration: mockConfiguration,
    createdAt: '2024-01-03T10:00:00.000Z',
    updatedAt: '2024-01-03T10:00:00.000Z',
  },
]

describe('ProfileManagement', () => {
  // Helper function to render and expand the component
  const renderAndExpand = () => {
    const result = render(
      <TestWrapper>
        <ProfileManagement />
      </TestWrapper>,
    )

    // Expand the component
    const trigger = result.container.querySelector('[aria-controls]')
    if (trigger) {
      fireEvent.click(trigger)
    }

    return result
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    vi.mocked(profileStorage.getAllProfiles).mockReturnValue(mockProfiles)
    vi.mocked(profileStorage.getActiveProfile).mockReturnValue(mockProfiles[0])
    vi.mocked(profileStorage.hasProfiles).mockReturnValue(true)
    vi.mocked(profileStorage.getProfileCount).mockReturnValue(mockProfiles.length)
    vi.mocked(profileStorage.setActiveProfile).mockReturnValue(true)
    vi.mocked(profileStorage.updateProfile).mockReturnValue(true)
    vi.mocked(profileStorage.deleteProfile).mockReturnValue(true)
    mockConfirm.mockReturnValue(true)
  })

  describe('Basic Rendering', () => {
    it('renders the profile management card', () => {
      render(
        <TestWrapper>
          <ProfileManagement />
        </TestWrapper>,
      )

      expect(screen.getByText('👤 Profile verwalten')).toBeInTheDocument()
    })

    it('renders as collapsed by default', () => {
      render(
        <TestWrapper>
          <ProfileManagement />
        </TestWrapper>,
      )

      // Content should not be visible initially
      expect(screen.queryByText('Verfügbare Profile')).not.toBeInTheDocument()
    })

    it('expands to show profile content when clicked', () => {
      const { container } = render(
        <TestWrapper>
          <ProfileManagement />
        </TestWrapper>,
      )

      const trigger = container.querySelector('[aria-controls]')
      fireEvent.click(trigger!)

      expect(screen.getByText(/Profile:/)).toBeInTheDocument()
      expect(screen.getByText('Aktives Profil:')).toBeInTheDocument()
    })
  })

  describe('Profile Display', () => {
    beforeEach(() => {
      renderAndExpand()
    })

    it('displays active profile information', () => {
      expect(screen.getByText('Aktives Profil:')).toBeInTheDocument()
      expect(screen.getByText('Standard Profil')).toBeInTheDocument()
      expect(screen.getByText('Automatisch erstelltes Standardprofil')).toBeInTheDocument()
    })

    it('displays list of all profiles', () => {
      expect(screen.getByText('Verfügbare Profile (3)')).toBeInTheDocument()
      expect(screen.getByText('Familie Müller')).toBeInTheDocument()
      expect(screen.getByText('Test Szenario')).toBeInTheDocument()
    })

    it('shows active profile badge', () => {
      expect(screen.getByText('Aktiv')).toBeInTheDocument()
    })

    it('displays profile creation dates', () => {
      expect(screen.getByText(/Erstellt: /)).toBeInTheDocument()
    })
  })

  describe('Profile Creation', () => {
    beforeEach(() => {
      renderAndExpand()
    })

    it('opens create dialog when new profile button is clicked', () => {
      const newProfileButton = screen.getByText('Neues Profil')
      fireEvent.click(newProfileButton)

      expect(screen.getByText('Neues Profil erstellen')).toBeInTheDocument()
      expect(screen.getByLabelText('Profilname *')).toBeInTheDocument()
      expect(screen.getByLabelText('Beschreibung (optional)')).toBeInTheDocument()
    })

    it('creates a new profile with valid data', async () => {
      const mockNewProfile = {
        id: 'new-profile',
        name: 'Neues Profil',
        description: 'Test Beschreibung',
        configuration: mockConfiguration,
        createdAt: '2024-01-04T10:00:00.000Z',
        updatedAt: '2024-01-04T10:00:00.000Z',
      }

      vi.mocked(profileStorage.createProfile).mockReturnValue(mockNewProfile)

      const newProfileButton = screen.getByText('Neues Profil')
      fireEvent.click(newProfileButton)

      const nameInput = screen.getByLabelText('Profilname *')
      const descriptionInput = screen.getByLabelText('Beschreibung (optional)')
      const createButton = screen.getByText('Profil erstellen')

      fireEvent.change(nameInput, { target: { value: 'Neues Profil' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test Beschreibung' } })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(profileStorage.createProfile).toHaveBeenCalledWith(
          'Neues Profil',
          expect.any(Object),
          'Test Beschreibung',
        )
        expect(profileStorage.setActiveProfile).toHaveBeenCalledWith('new-profile')
        expect(toast.success).toHaveBeenCalledWith('Profil "Neues Profil" wurde erstellt und aktiviert')
      })
    })

    it('shows error when trying to create profile without name', async () => {
      const newProfileButton = screen.getByText('Neues Profil')
      fireEvent.click(newProfileButton)

      const createButton = screen.getByText('Profil erstellen')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Profilname ist erforderlich')
        expect(profileStorage.createProfile).not.toHaveBeenCalled()
      })
    })
  })

  describe('Profile Editing', () => {
    beforeEach(() => {
      renderAndExpand()
    })

    it('opens edit dialog when edit button is clicked', () => {
      const editButtons = screen.getAllByTitle('Profil bearbeiten')
      fireEvent.click(editButtons[0])

      expect(screen.getByText('Profil bearbeiten')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Standard Profil')).toBeInTheDocument()
    })

    it('updates profile with valid data', async () => {
      const editButtons = screen.getAllByTitle('Profil bearbeiten')
      fireEvent.click(editButtons[0])

      const nameInput = screen.getByDisplayValue('Standard Profil')
      const saveButton = screen.getByText('Änderungen speichern')

      fireEvent.change(nameInput, { target: { value: 'Aktualisiertes Profil' } })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(profileStorage.updateProfile).toHaveBeenCalledWith('default', {
          name: 'Aktualisiertes Profil',
          description: 'Automatisch erstelltes Standardprofil',
        })
        expect(toast.success).toHaveBeenCalledWith('Profil "Aktualisiertes Profil" wurde aktualisiert')
      })
    })
  })

  describe('Profile Switching', () => {
    beforeEach(() => {
      renderAndExpand()
    })

    it('switches to another profile when activate button is clicked', async () => {
      const activateButtons = screen.getAllByText('Aktivieren')
      fireEvent.click(activateButtons[0])

      await waitFor(() => {
        expect(profileStorage.setActiveProfile).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('gewechselt'))
      })
    })

    it('does not show activate button for active profile', () => {
      // The active profile should not have an "Aktivieren" button
      const profileCards = screen.getAllByText(/Erstellt:/).map(el => el.closest('[class*="border"]'))
      const activeCard = profileCards.find(card => card?.textContent?.includes('Aktiv'))

      expect(activeCard).toBeDefined()
      expect(activeCard?.textContent).not.toContain('Aktivieren')
    })
  })

  describe('Profile Duplication', () => {
    beforeEach(() => {
      renderAndExpand()
    })

    it('duplicates a profile when duplicate button is clicked', async () => {
      const mockDuplicatedProfile = {
        id: 'duplicated-profile',
        name: 'Standard Profil (Kopie)',
        description: 'Kopie von "Standard Profil"',
        configuration: mockConfiguration,
        createdAt: '2024-01-04T10:00:00.000Z',
        updatedAt: '2024-01-04T10:00:00.000Z',
      }

      vi.mocked(profileStorage.duplicateProfile).mockReturnValue(mockDuplicatedProfile)

      const duplicateButtons = screen.getAllByTitle('Profil duplizieren')
      fireEvent.click(duplicateButtons[0])

      await waitFor(() => {
        expect(profileStorage.duplicateProfile).toHaveBeenCalledWith('default', 'Standard Profil (Kopie)')
        expect(toast.success).toHaveBeenCalledWith('Profil "Standard Profil (Kopie)" wurde erstellt')
      })
    })
  })

  describe('Profile Deletion', () => {
    beforeEach(() => {
      renderAndExpand()
    })

    it('deletes a profile after confirmation', async () => {
      const deleteButtons = screen.getAllByTitle('Profil löschen')
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining('Familie Müller'))
        expect(profileStorage.deleteProfile).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('gelöscht'))
      })
    })

    it('does not delete profile when confirmation is declined', async () => {
      mockConfirm.mockReturnValue(false)

      const deleteButtons = screen.getAllByTitle('Profil löschen')
      fireEvent.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled()
        expect(profileStorage.deleteProfile).not.toHaveBeenCalled()
      })
    })

    it('does not show delete button when only one profile exists', () => {
      vi.mocked(profileStorage.getAllProfiles).mockReturnValue([mockProfiles[0]])
      vi.mocked(profileStorage.getProfileCount).mockReturnValue(1)

      renderAndExpand()

      expect(screen.queryByTitle('Profil löschen')).not.toBeInTheDocument()
    })
  })

  describe('Clear All Profiles', () => {
    beforeEach(() => {
      renderAndExpand()
    })

    it('clears all profiles after confirmation', async () => {
      const clearButton = screen.getByText('🗑️ Alle Profile löschen')
      fireEvent.click(clearButton)

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith(expect.stringContaining('alle Profile löschen'))
        expect(profileStorage.clearAllProfiles).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Alle Profile wurden gelöscht und auf Standardwerte zurückgesetzt.')
      })
    })

    it('is disabled when no profiles exist', () => {
      vi.mocked(profileStorage.hasProfiles).mockReturnValue(false)

      const { container } = render(
        <TestWrapper>
          <ProfileManagement />
        </TestWrapper>,
      )

      const trigger = container.querySelector('[aria-controls]')
      fireEvent.click(trigger!)

      const clearButtons = screen.getAllByText('🗑️ Alle Profile löschen')
      const clearButton = clearButtons.find(button => button.closest('[data-nesting-level="0"]'))
      expect(clearButton).toBeDisabled()
    })
  })

  describe('Empty State', () => {
    it('displays appropriate message when no profiles exist', () => {
      vi.mocked(profileStorage.getAllProfiles).mockReturnValue([])
      vi.mocked(profileStorage.getActiveProfile).mockReturnValue(null)
      vi.mocked(profileStorage.hasProfiles).mockReturnValue(false)
      vi.mocked(profileStorage.getProfileCount).mockReturnValue(0)

      renderAndExpand()

      expect(screen.getByText(/Keine Profile vorhanden/)).toBeInTheDocument()
      expect(screen.queryByText('Aktives Profil:')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      renderAndExpand()
    })

    it('handles profile creation errors', async () => {
      vi.mocked(profileStorage.createProfile).mockImplementation(() => {
        throw new Error('Storage error')
      })

      const newProfileButton = screen.getByText('Neues Profil')
      fireEvent.click(newProfileButton)

      const nameInput = screen.getByLabelText('Profilname *')
      const createButton = screen.getByText('Profil erstellen')

      fireEvent.change(nameInput, { target: { value: 'Test Profil' } })
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Fehler beim Erstellen des Profils')
      })
    })

    it('handles profile switching errors', async () => {
      vi.mocked(profileStorage.setActiveProfile).mockReturnValue(false)

      const activateButtons = screen.getAllByText('Aktivieren')
      fireEvent.click(activateButtons[0])

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Fehler beim Wechseln des Profils')
      })
    })

    it('handles profile update errors', async () => {
      vi.mocked(profileStorage.updateProfile).mockReturnValue(false)

      const editButtons = screen.getAllByTitle('Profil bearbeiten')
      fireEvent.click(editButtons[0])

      const saveButton = screen.getByText('Änderungen speichern')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Fehler beim Aktualisieren des Profils')
      })
    })
  })
})
