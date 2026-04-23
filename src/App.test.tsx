import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('Operator admin routes', () => {
  it('renders dashboard content by default route redirect', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByText('Your houseboat performance at a glance')).toBeInTheDocument()
  })

  it('renders boat asset page route', () => {
    render(
      <MemoryRouter initialEntries={['/boat']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Boat asset definition' })).toBeInTheDocument()
    expect(screen.getByText('Identity & classification')).toBeInTheDocument()
  })
})
