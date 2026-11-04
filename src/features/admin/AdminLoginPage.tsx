import { LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSupabaseClient } from '../../lib/supabase'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const client = getSupabaseClient()
    if (!client) {
      setError('La connexion admin nécessite une configuration Supabase.')
      return
    }
    setIsSubmitting(true)
    setError('')
    const result = await client.auth.signInWithPassword({ email, password })
    if (result.error) {
      setError('Identifiants invalides ou compte non autorisé.')
      setIsSubmitting(false)
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <main className="admin-auth-page">
      <form className="admin-auth-card" onSubmit={submit}>
        <LockKeyhole aria-hidden="true" size={25} />
        <p className="eyebrow">Espace privé</p>
        <h1>Connexion admin</h1>
        <p>Cette zone est réservée aux profils Whimsea autorisés.</p>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && (
          <p className="checkout-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button button-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>
        <Link className="text-link" to="/">
          Retour à la boutique
        </Link>
      </form>
    </main>
  )
}
