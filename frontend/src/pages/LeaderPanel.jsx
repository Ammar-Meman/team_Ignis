import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import './LeaderPanel.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://team-ignis.onrender.com'

const LeaderPanel = () => {
  const { user } = useAuth()
  const [games, setGames] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const inputRef = useRef(null)
  const editRef = useRef(null)

  /** Fetch games from backend on mount */
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(`${API_URL}/api/games`)
        if (res.ok) {
          const data = await res.json()
          setGames(data.map((g, i) => ({ rank: i + 1, name: g.name })))
        }
      } catch (e) {
        console.warn('Failed to fetch games:', e)
      } finally {
        setLoaded(true)
      }
    }
    fetchGames()
  }, [])

  /** Save current games list to the backend */
  const syncToBackend = async (updatedGames) => {
    if (!user?.token) return
    setSaving(true)
    try {
      await fetch(`${API_URL}/api/games`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ games: updatedGames }),
      })
    } catch (e) {
      console.error('Failed to save games to backend:', e)
    } finally {
      setSaving(false)
    }
  }

  // Focus edit input when editing begins
  useEffect(() => {
    if (editingId !== null && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editingId])

  /** Check for duplicate name (case-insensitive), excluding a given id */
  const isDuplicate = (name, excludeId = null) => {
    return games.some(
      g => g.name.toLowerCase() === name.toLowerCase() && g.rank !== excludeId
    )
  }

  /** Re-sequence ranks 1,2,3... */
  const resequence = (list) => {
    return list.map((g, i) => ({ ...g, rank: i + 1 }))
  }

  /** Add a new game */
  const handleAddGame = () => {
    if (isAdding) return // prevent rapid clicks

    const trimmed = inputValue.trim()
    if (!trimmed) {
      setError('Game name cannot be empty.')
      return
    }
    if (isDuplicate(trimmed)) {
      setError(`"${trimmed}" already exists.`)
      return
    }

    setIsAdding(true)
    setError('')

    const newGame = {
      rank: games.length + 1,
      name: trimmed
    }

    const updated = [...games, newGame]
    setGames(updated)
    syncToBackend(updated)
    setInputValue('')

    // Re-enable after a short delay to prevent double-clicks
    setTimeout(() => setIsAdding(false), 300)

    // Focus input for quick consecutive adds
    if (inputRef.current) inputRef.current.focus()
  }

  /** Handle Enter key on add input */
  const handleAddKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddGame()
    }
  }

  /** Start editing a game */
  const startEdit = (game) => {
    setEditingId(game.rank)
    setEditValue(game.name)
    setError('')
  }

  /** Cancel editing */
  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
    setError('')
  }

  /** Save edited game */
  const saveEdit = (rank) => {
    const trimmed = editValue.trim()
    if (!trimmed) {
      setError('Game name cannot be empty.')
      return
    }
    if (isDuplicate(trimmed, rank)) {
      setError(`"${trimmed}" already exists.`)
      return
    }

    const updated = games.map(g => g.rank === rank ? { ...g, name: trimmed } : g)
    setGames(updated)
    syncToBackend(updated)
    setEditingId(null)
    setEditValue('')
    setError('')
  }

  /** Handle Enter/Escape on edit input */
  const handleEditKeyDown = (e, rank) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit(rank)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  /** Delete a game and re-sequence ranks */
  const handleDelete = (rank) => {
    const updated = resequence(games.filter(g => g.rank !== rank))
    setGames(updated)
    syncToBackend(updated)
    if (editingId === rank) cancelEdit()
  }

  if (!loaded) {
    return (
      <div className="ignis-container leader-page" style={{ textAlign: 'center', paddingTop: '8rem' }}>
        <span className="ignis-mono" style={{ color: 'var(--ignis-orange)' }}>Loading games...</span>
      </div>
    )
  }

  return (
    <div className="ignis-container leader-page">
      <Helmet>
        <title>Leader Panel — IGNIS JWAALA</title>
        <meta name="description" content="Exclusive dashboard for the Vanguard leaders to oversee the arena metrics." />
      </Helmet>
      <div className="section-header">
        <h1 className="ignis-title"><span className="ignis-fire-text">LEADER</span> PANEL</h1>
        <p className="section-subtitle">Command the Arena. Select and rank the active games.</p>
      </div>

      {saving && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span className="ignis-mono" style={{ color: 'var(--ignis-orange)', fontSize: '0.8rem' }}>⏳ SYNCING TO SERVER...</span>
        </div>
      )}

      <div className="leader-grid">
        {/* ── GAME SELECTOR ── */}
        <div className="ignis-panel leader-selector">
          <h2 className="ignis-heading" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            Game Selector
          </h2>

          {/* Add Game */}
          <div className="leader-add-form">
            <div className="leader-add-row">
              <input
                ref={inputRef}
                className="ignis-input"
                placeholder="Enter game name..."
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setError('') }}
                onKeyDown={handleAddKeyDown}
              />
              <button
                className="ignis-btn-primary leader-add-btn"
                onClick={handleAddGame}
                disabled={isAdding}
              >
                ADD GAME
              </button>
            </div>
            {error && <p className="leader-error">{error}</p>}
          </div>

          {/* Game List */}
          <div className="leader-game-list">
            {games.length === 0 ? (
              <div className="leader-empty">
                <span className="leader-empty__icon">🎮</span>
                <p className="leader-empty__text">No games added yet.</p>
                <p className="leader-empty__sub">Add a game above to get started.</p>
              </div>
            ) : (
              games.map(game => (
                <div
                  key={game.rank}
                  className={`leader-game-item ${game.rank === 1 ? 'leader-game-item--top' : ''}`}
                >
                  <span className={`leader-rank ${game.rank === 1 ? 'leader-rank--gold' : ''}`}>
                    #{game.rank}
                  </span>

                  {editingId === game.rank ? (
                    <div className="leader-edit-row">
                      <input
                        ref={editRef}
                        className="ignis-input leader-edit-input"
                        value={editValue}
                        onChange={(e) => { setEditValue(e.target.value); setError('') }}
                        onKeyDown={(e) => handleEditKeyDown(e, game.rank)}
                      />
                      <button
                        className="ignis-btn-primary leader-action-btn"
                        onClick={() => saveEdit(game.rank)}
                      >
                        ✓
                      </button>
                      <button
                        className="ignis-btn-outline leader-action-btn"
                        onClick={cancelEdit}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="leader-game-name">{game.name}</span>
                      <div className="leader-game-actions">
                        <button
                          className="ignis-btn-outline leader-action-btn"
                          onClick={() => startEdit(game)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="ignis-btn-outline leader-action-btn leader-action-btn--delete"
                          onClick={() => handleDelete(game.rank)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── LIVE PREVIEW ── */}
        <div className="leader-preview">
          <div className="ignis-panel">
            <h2 className="ignis-heading" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Live Preview
            </h2>
            <p className="ignis-mono" style={{ marginBottom: '1.5rem', fontSize: '0.75rem' }}>
              // HOW YOUR MODULES WILL APPEAR ON THE HOMEPAGE
            </p>

            {games.length === 0 ? (
              <div className="leader-preview-empty">
                <p className="ignis-mono" style={{ color: 'var(--ignis-muted)' }}>
                  Fallback modules will be displayed when no games are selected.
                </p>
              </div>
            ) : (
              <div className="leader-preview-grid">
                {games.map(game => (
                  <div
                    key={game.rank}
                    className={`leader-preview-card ignis-card ${game.rank === 1 ? 'leader-preview-card--top' : ''}`}
                  >
                    {game.rank === 1 && (
                      <span className="leader-preview-badge">🏆 #1</span>
                    )}
                    <span className="leader-preview-rank">RANK {game.rank}</span>
                    <h3 className="leader-preview-name">{game.name}</h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderPanel
