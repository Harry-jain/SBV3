# SyncBoard Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- PostgreSQL 16+ (if running without Docker)
- Redis 7+ (if running without Docker)

## Local Development

### 1. Setup Environment Variables

Create a `.env` file in the root directory:

\`\`\`env
# Database
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_NAME=collaborative_ide
DATABASE_URL=postgresql://postgres:your-secure-password@localhost:5432/collaborative_ide

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=24h

# Environment
NODE_ENV=development

# Services
AUTH_SERVICE_URL=http://localhost:3001
REALTIME_SERVICE_URL=http://localhost:3002
IDE_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

### 2. Start Services with Docker Compose

\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
- PostgreSQL database on port 5432
- Auth service on port 3001
- Realtime service on port 3002
- API Gateway on port 3000
- Redis on port 6379

### 3. Run Database Migrations

\`\`\`bash
docker-compose exec postgres psql -U postgres -d collaborative_ide -f /docker-entrypoint-initdb.d/init.sql
\`\`\`

### 4. Start Web Client (Development)

\`\`\`bash
npm install
npm run dev
\`\`\`

The web client will be available at http://localhost:3000

## Production Deployment

### 1. Update Environment Variables

Update `.env` with production values:

\`\`\`env
DB_USER=prod_user
DB_PASSWORD=very-secure-password
DB_NAME=collaborative_ide_prod
JWT_SECRET=production-secret-key-very-long-and-secure
NODE_ENV=production
\`\`\`

### 2. Deploy with Docker Compose

\`\`\`bash
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### 3. Verify Services

Check service health:

\`\`\`bash
# Check all containers
docker-compose ps

# Check logs
docker-compose logs -f gateway
docker-compose logs -f auth-service
docker-compose logs -f realtime-service
\`\`\`

### 4. Test API Endpoints

\`\`\`bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
\`\`\`

## Scaling Considerations

### Horizontal Scaling

1. **API Gateway**: Use a load balancer (nginx, HAProxy) to distribute traffic
2. **Auth Service**: Stateless, can scale horizontally
3. **Realtime Service**: Use Redis pub/sub for cross-instance communication
4. **Database**: Consider read replicas for scaling reads

### Performance Optimization

1. **Caching**: Implement Redis caching for frequently accessed data
2. **Database Indexing**: Ensure proper indexes on frequently queried columns
3. **Connection Pooling**: Use PgBouncer for database connection pooling
4. **CDN**: Serve static assets through a CDN

## Monitoring and Logging

### Health Checks

All services expose `/health` endpoints:
- Gateway: http://localhost:3000/health
- Auth Service: http://localhost:3001/health
- Realtime Service: http://localhost:3002/health

### Logs

View service logs:

\`\`\`bash
docker-compose logs -f [service-name]
\`\`\`

## Troubleshooting

### Services Won't Start

1. Check port availability: \`lsof -i :3000\`
2. Check Docker logs: \`docker-compose logs\`
3. Verify environment variables are set correctly

### Database Connection Issues

1. Verify PostgreSQL is running: \`docker-compose ps postgres\`
2. Check connection string in .env
3. Verify database exists: \`docker-compose exec postgres psql -U postgres -l\`

### WebSocket Connection Issues

1. Verify realtime service is running
2. Check JWT token is valid
3. Verify room ID is correct
4. Check browser console for errors

## Backup and Recovery

### Database Backup

\`\`\`bash
docker-compose exec postgres pg_dump -U postgres collaborative_ide > backup.sql
\`\`\`

### Database Restore

\`\`\`bash
docker-compose exec -T postgres psql -U postgres collaborative_ide < backup.sql
\`\`\`

### Redis Backup

\`\`\`bash
docker-compose exec redis redis-cli BGSAVE
\`\`\`
