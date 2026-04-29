import React, { useState } from 'react'
import './Polls.css'

const INITIAL_POLLS = [
  {
    id: 1,
    title: "Which faction will dominate the next Great Ember War?",
    description: "The stars align for a new conflict. Cast your vote for the ultimate victor.",
    options: [
      { id: 'a', text: "House Ignis (Fire)", votes: 124 },
      { id: 'b', text: "Aqua Legion (Water)", votes: 89 },
      { id: 'c', text: "Terra Alliance (Earth)", votes: 76 },
      { id: 'd', text: "Aero Syndicate (Air)", votes: 45 }
    ],
    totalVotes: 334,
    multiple: true,
    author: "Grand_Master_Kael",
    createdAt: "2h ago"
  },
  {
    id: 2,
    title: "Preferred weapon class for the Arena V2 update?",
    description: "The forge is heating up. What should our smiths focus on next?",
    options: [
      { id: 'a', text: "Heavy Greatswords", votes: 210 },
      { id: 'b', text: "Dual Daggers", votes: 156 },
      { id: 'c', text: "Elemental Staves", votes: 189 }
    ],
    totalVotes: 555,
    multiple: false,
    author: "Arena_Dev_Team",
    createdAt: "5h ago"
  },
  {
    id: 3,
    title: "Should we introduce a 24/7 Hardcore Survival mode?",
    description: "One life, one chance. Permadeath enabled. Is the community ready for the ultimate challenge?",
    options: [
      { id: 'a', text: "Yes, I crave the heat", votes: 412 },
      { id: 'b', text: "No, keep it competitive only", votes: 103 },
      { id: 'c', text: "Maybe with special rewards", votes: 245 }
    ],
    totalVotes: 760,
    multiple: false,
    author: "Community_Manager",
    createdAt: "8h ago"
  },
  {
    id: 4,
    title: "Select all features you want in the next seasonal update:",
    description: "Choose multiple if you can't decide. We are listening.",
    options: [
      { id: 'a', text: "Dynamic Weather Systems", votes: 567 },
      { id: 'b', text: "Custom Guild Emblems", votes: 432 },
      { id: 'c', text: "Mounted Combat", votes: 689 },
      { id: 'd', text: "Advanced Photo Mode", votes: 210 }
    ],
    totalVotes: 1898,
    multiple: true,
    author: "System_Architect",
    createdAt: "12h ago"
  }
]

const Polls = () => {
  const [polls, setPolls] = useState(INITIAL_POLLS)
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    multiple: true
  })

  // Handle Poll Creation
  const handleAddOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })
  }

  const handleRemoveOption = (index) => {
    if (newPoll.options.length <= 2) return
    const updated = newPoll.options.filter((_, i) => i !== index)
    setNewPoll({ ...newPoll, options: updated })
  }

  const handleOptionChange = (index, value) => {
    const updated = [...newPoll.options]
    updated[index] = value
    setNewPoll({ ...newPoll, options: updated })
  }

  const onCreatePoll = (e) => {
    e.preventDefault()
    if (!newPoll.title || newPoll.options.some(opt => !opt)) return

    const pollToAdd = {
      id: Date.now(),
      title: newPoll.title,
      description: newPoll.description,
      options: newPoll.options.map((opt, i) => ({
        id: String.fromCharCode(97 + i),
        text: opt,
        votes: 0
      })),
      totalVotes: 0,
      multiple: newPoll.multiple,
      author: "You",
      createdAt: "Just now"
    }

    setPolls([pollToAdd, ...polls])
    setNewPoll({ title: '', description: '', options: ['', ''], multiple: true })
  }

  // Handle Voting
  const handleVote = (pollId, optionId) => {
    setPolls(prevPolls => prevPolls.map(poll => {
      if (poll.id !== pollId) return poll
      
      const updatedOptions = poll.options.map(opt => {
        if (opt.id === optionId) {
          // Check if already voted (simplified logic for dummy demo)
          return { ...opt, votes: opt.votes + 1 }
        }
        return opt
      })

      return {
        ...poll,
        options: updatedOptions,
        totalVotes: poll.totalVotes + 1
      }
    }))
  }

  return (
    <div className="ignis-container polls-page">
      <div className="section-header">
        <h1 className="ignis-title"><span className="ignis-fire-text">IGNIS</span> POLLS</h1>
        <p className="section-subtitle">The voice of the community shapes the future of the Arena.</p>
      </div>

      <div className="polls-grid">
        {/* ── CREATE POLL SIDEBAR ── */}
        <aside className="create-poll-panel">
          <div className="ignis-panel">
            <h2 className="ignis-heading" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Forge New Poll</h2>
            <form className="create-poll-form" onSubmit={onCreatePoll}>
              <div className="login-field">
                <label className="login-field__label">Question</label>
                <input 
                  className="ignis-input" 
                  placeholder="What is your command?" 
                  value={newPoll.title}
                  onChange={(e) => setNewPoll({...newPoll, title: e.target.value})}
                  required
                />
              </div>

              <div className="login-field">
                <label className="login-field__label">Description (Optional)</label>
                <textarea 
                  className="ignis-input" 
                  style={{ minHeight: '80px', resize: 'none' }}
                  placeholder="Add context to your query..."
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({...newPoll, description: e.target.value})}
                />
              </div>

              <div className="login-field">
                <label className="login-field__label">Options</label>
                {newPoll.options.map((opt, i) => (
                  <div key={i} className="poll-option-input-group">
                    <input 
                      className="ignis-input" 
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      required
                    />
                    {newPoll.options.length > 2 && (
                      <button type="button" className="remove-option-btn" onClick={() => handleRemoveOption(i)}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-option-btn" onClick={handleAddOption}>
                  + Add Option
                </button>
              </div>

              <div className="login-field">
                <label className="login-field__label">Answer Mode</label>
                <div className="poll-type-toggle">
                  <button 
                    type="button" 
                    className={`poll-type-btn ${!newPoll.multiple ? 'active' : ''}`}
                    onClick={() => setNewPoll({...newPoll, multiple: false})}
                  >
                    Single Answer
                  </button>
                  <button 
                    type="button" 
                    className={`poll-type-btn ${newPoll.multiple ? 'active' : ''}`}
                    onClick={() => setNewPoll({...newPoll, multiple: true})}
                  >
                    Multi Answer
                  </button>
                </div>
              </div>

              <button type="submit" className="ignis-btn-primary" style={{ width: '100%' }}>
                IGNITE POLL 🔥
              </button>
            </form>
          </div>
        </aside>

        {/* ── POLLS FEED ── */}
        <main className="polls-feed">
          {polls.map(poll => (
            <div key={poll.id} className="ignis-panel poll-card">
              <div className="poll-card__header">
                <h3 className="poll-card__title">{poll.title}</h3>
                {poll.description && <p className="poll-card__meta" style={{ textTransform: 'none', color: 'var(--ignis-muted)', marginBottom: '8px' }}>{poll.description}</p>}
                <div className="poll-card__meta">
                  Posted by <span style={{ color: 'var(--ignis-orange)' }}>{poll.author}</span> • {poll.createdAt} • {poll.multiple ? 'Multiple Choice' : 'Single Choice'}
                </div>
              </div>

              <div className="poll-options-list">
                {poll.options.map(opt => {
                  const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0
                  return (
                    <label key={opt.id} className="poll-vote-option">
                      <input 
                        type={poll.multiple ? "checkbox" : "radio"} 
                        name={`poll-${poll.id}`}
                        onChange={() => handleVote(poll.id, opt.id)}
                      />
                      <div className="poll-vote-option__content">
                        <div className="poll-result-bar" style={{ width: `${percentage}%` }} />
                        <div className="poll-vote-option__label">
                          <span className="poll-vote-option__check">{poll.multiple ? '✓' : '●'}</span>
                          {opt.text}
                        </div>
                        <div className="poll-vote-count">{percentage}% ({opt.votes})</div>
                      </div>
                    </label>
                  )
                })}
              </div>

              <div className="poll-card__footer">
                <span className="poll-total-votes">{poll.totalVotes} total votes recorded</span>
                <div className="hero__cta">
                  <button className="ignis-btn-outline" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>SHARE</button>
                  <button className="ignis-btn-outline" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>REPORT</button>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}

export default Polls
