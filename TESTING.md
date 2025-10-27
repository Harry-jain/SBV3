# SyncBoard Testing Guide

## Unit Testing

### Setup

\`\`\`bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
\`\`\`

### Example Test

\`\`\`javascript
// __tests__/auth.test.js
describe('Authentication', () => {
  test('should register a new user', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        full_name: 'Test User'
      })
    })
    
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.user).toBeDefined()
    expect(data.token).toBeDefined()
  })
})
\`\`\`

## Integration Testing

### Test Scenarios

1. **User Registration and Login**
   - Register new user
   - Login with credentials
   - Verify token is returned

2. **Real-time Collaboration**
   - Connect to WebSocket
   - Send code update
   - Verify broadcast to other users

3. **Room Management**
   - Create room
   - Join room
   - Verify user list
   - Leave room

### Example Integration Test

\`\`\`javascript
// __tests__/integration.test.js
describe('Real-time Collaboration', () => {
  test('should sync code changes', async () => {
    // 1. Register and login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    const { token } = await loginRes.json()
    
    // 2. Connect to WebSocket
    const ws = new WebSocket(\`ws://localhost:3002?token=\${token}&room=test-room\`)
    
    // 3. Send code update
    ws.send(JSON.stringify({
      type: 'code-update',
      content: 'console.log("Hello")'
    }))
    
    // 4. Verify message received
    await new Promise(resolve => {
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        expect(message.type).toBe('code-update')
        resolve()
      }
    })
  })
})
\`\`\`

## Load Testing

### Using Apache Bench

\`\`\`bash
# Test login endpoint
ab -n 1000 -c 10 -p data.json -T application/json http://localhost:3000/api/auth/login
\`\`\`

### Using k6

\`\`\`javascript
// load-test.js
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  vus: 10,
  duration: '30s',
}

export default function () {
  let response = http.post('http://localhost:3000/api/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  })
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== null,
  })
}
\`\`\`

## Manual Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] User can create a room
- [ ] User can join a room
- [ ] Code changes sync in real-time
- [ ] Multiple users can edit simultaneously
- [ ] User presence is tracked
- [ ] WebSocket reconnects on disconnect
- [ ] Logout clears session
- [ ] Invalid tokens are rejected
