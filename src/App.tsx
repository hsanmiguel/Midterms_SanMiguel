import { useState } from 'react'
import './App.css'

type UserV1 = {
  id: string
  username: string
  emailAddress: string
}

type UserV2 = {
  id: string
  username: string
  email: string
}

type UserProfile = {
  id: string
  username: string
  profilePicture?: string | null
}

type InMemoryUser = {
  id: string
  username: string
  email: string
  profilePicture?: string | null
}

type RegistrationRequestV1 = {
  username: string
  emailAddress: string
}

type RegistrationRequestV2 = {
  username: string
  email: string
}

const initialUserStore: Record<string, InMemoryUser> = {
  '101': {
    id: '101',
    username: 'john',
    email: 'john@email.com',
    profilePicture: 'https://example.com/images/john.jpg',
  },
}

function postApiV1Users(id: string, payload: RegistrationRequestV1): UserV1 {
  return {
    id,
    username: payload.username,
    emailAddress: payload.emailAddress,
  }
}

function postApiV2Users(id: string, payload: RegistrationRequestV2): UserV2 {
  return {
    id,
    username: payload.username,
    email: payload.email,
  }
}

function getApiV1UserById(
  users: Record<string, InMemoryUser>,
  id: string,
  includeProfilePicture = true,
): UserProfile {
  const user = users[id]

  if (!user) {
    return {
      id,
      username: 'unknown',
      profilePicture: null,
    }
  }

  if (!includeProfilePicture) {
    return {
      id: user.id,
      username: user.username,
    }
  }

  return {
    id: user.id,
    username: user.username,
    profilePicture: user.profilePicture ?? null,
  }
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

function App() {
  const [scenario1Version, setScenario1Version] = useState<'v1' | 'v2'>('v1')
  const [usersById, setUsersById] = useState<Record<string, InMemoryUser>>(initialUserStore)
  const [nextId, setNextId] = useState(102)

  const [scenario1Username, setScenario1Username] = useState('john')
  const [scenario1EmailAddress, setScenario1EmailAddress] = useState('john@email.com')
  const [scenario1Email, setScenario1Email] = useState('john@email.com')
  const [scenario1Request, setScenario1Request] = useState<RegistrationRequestV1 | RegistrationRequestV2>({
    username: 'john',
    emailAddress: 'john@email.com',
  })
  const [scenario1Response, setScenario1Response] = useState<UserV1 | UserV2>(
    postApiV1Users('101', { username: 'john', emailAddress: 'john@email.com' }),
  )

  const [scenario2UserId, setScenario2UserId] = useState('101')
  const [scenario2IncludePicture, setScenario2IncludePicture] = useState(true)
  const [scenario2Response, setScenario2Response] = useState<UserProfile>(
    getApiV1UserById(initialUserStore, '101', true),
  )

  const scenario1Endpoint =
    scenario1Version === 'v1' ? 'POST /api/v1/users' : 'POST /api/v2/users'

  function handleScenario1Run(): void {
    const id = String(nextId)
    setNextId((value) => value + 1)

    if (scenario1Version === 'v1') {
      const request: RegistrationRequestV1 = {
        username: scenario1Username,
        emailAddress: scenario1EmailAddress,
      }
      const response = postApiV1Users(id, request)

      setUsersById((prev) => ({
        ...prev,
        [id]: {
          id,
          username: request.username,
          email: request.emailAddress,
          profilePicture: null,
        },
      }))
      setScenario1Request(request)
      setScenario1Response(response)
      return
    }

    const request: RegistrationRequestV2 = {
      username: scenario1Username,
      email: scenario1Email,
    }
    const response = postApiV2Users(id, request)

    setUsersById((prev) => ({
      ...prev,
      [id]: {
        id,
        username: request.username,
        email: request.email,
        profilePicture: null,
      },
    }))
    setScenario1Request(request)
    setScenario1Response(response)
  }

  function handleScenario2Run(): void {
    setScenario2Response(getApiV1UserById(usersById, scenario2UserId.trim(), scenario2IncludePicture))
  }

  return (
    <main className="exam-page">
      <header className="page-header">
        <h1>API Versioning Demo</h1>
      </header>

      <section className="card">
        <div className="card-head">
          <h2>Scenario 1: User Registration Field Rename</h2>
          <div className="version-switch" role="group" aria-label="Choose API version">
            <button
              className={scenario1Version === 'v1' ? 'active' : ''}
              onClick={() => setScenario1Version('v1')}
            >
              Version 1
            </button>
            <button
              className={scenario1Version === 'v2' ? 'active' : ''}
              onClick={() => setScenario1Version('v2')}
            >
              Version 2
            </button>
          </div>
        </div>

        <p className="endpoint">{scenario1Endpoint}</p>

        <div className="control-grid">
          <label>
            Username
            <input
              value={scenario1Username}
              onChange={(event) => setScenario1Username(event.target.value)}
              placeholder="Enter username"
            />
          </label>

          {scenario1Version === 'v1' ? (
            <label>
              emailAddress
              <input
                value={scenario1EmailAddress}
                onChange={(event) => setScenario1EmailAddress(event.target.value)}
                placeholder="Enter emailAddress"
              />
            </label>
          ) : (
            <label>
              email
              <input
                value={scenario1Email}
                onChange={(event) => setScenario1Email(event.target.value)}
                placeholder="Enter email"
              />
            </label>
          )}

          <button className="run-btn" onClick={handleScenario1Run}>
            Run Endpoint
          </button>
        </div>

        <div className="json-grid">
          <article>
            <h3>Request Sent</h3>
            <pre>{formatJson(scenario1Request)}</pre>
          </article>
          <article>
            <h3>Response Received</h3>
            <pre>{formatJson(scenario1Response)}</pre>
          </article>
        </div>

        <p className="note">
          V1 keeps emailAddress unchanged for existing clients, while v2 uses
          email for standardized naming.
        </p>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Scenario 2: Add Optional profilePicture</h2>
          <label className="toggle">
            <input
              type="checkbox"
              checked={scenario2IncludePicture}
              onChange={(event) => setScenario2IncludePicture(event.target.checked)}
            />
            Include profilePicture in response
          </label>
        </div>

        <p className="endpoint">GET /api/v1/users/{scenario2UserId || '{id}'}</p>

        <div className="control-grid">
          <label>
            User id
            <input
              value={scenario2UserId}
              onChange={(event) => setScenario2UserId(event.target.value)}
              placeholder="Enter user id (example: 101)"
            />
          </label>

          <button className="run-btn" onClick={handleScenario2Run}>
            Fetch User
          </button>
        </div>

        <article>
          <h3>Response Received</h3>
          <pre>{formatJson(scenario2Response)}</pre>
        </article>

        <p className="note">
          Scenario 2 stays backward-compatible because profilePicture is optional
          and additive.
        </p>
      </section>

      <section className="card">
        <h2>In-Memory Data Store (No Database)</h2>
        <p className="note">
          The API simulation writes and reads users directly from memory while
          the app is running.
        </p>
        <pre>{formatJson(usersById)}</pre>
      </section>

    </main>
  )
}

export default App
