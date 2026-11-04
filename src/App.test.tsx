import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Whimsea app shell', () => {
  it('renders the home page and primary navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /little treasures/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Boutique' })).toBeInTheDocument()
  })

  it('renders a graceful not-found page', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /cette page n’existe pas/i }),
    ).toBeInTheDocument()
  })

  it('renders catalog controls with demo or live catalog state', async () => {
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('searchbox')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Des détails pour tous les jours.' }),
    ).toBeInTheDocument()
  })
})
