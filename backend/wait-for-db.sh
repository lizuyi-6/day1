#!/bin/sh

# Database connection wait script
# This script waits for the database to be fully ready before allowing the application to start

set -e

host="$DB_HOST"
port="$DB_PORT"
user="$DB_USER"
db="$DB_NAME"

# Maximum number of attempts
MAX_ATTEMPTS=30
# Wait time between attempts (seconds)
WAIT_TIME=2

echo "Waiting for database to be ready..."
echo "  Host: $host"
echo "  Port: $port"
echo "  Database: $db"

attempt=1
while [ $attempt -le $MAX_ATTEMPTS ]; do
  echo "Attempt $attempt of $MAX_ATTEMPTS..."

  # Try to connect to the database
  if nc -z "$host" "$port" 2>/dev/null; then
    echo "✓ Port $port is open"

    # Try to connect and run a simple query
    if PGPASSWORD="$DB_PASSWORD" psql -h "$host" -U "$user" -d "$db" -c "SELECT 1" > /dev/null 2>&1; then
      echo "✓ Database is ready!"
      echo ""
      exit 0
    else
      echo "✗ Database port is open but not ready yet"
    fi
  else
    echo "✗ Cannot connect to port $port"
  fi

  attempt=$((attempt + 1))
  echo "Waiting ${WAIT_TIME}s before next attempt..."
  sleep $WAIT_TIME
done

echo ""
echo "=========================================="
echo "ERROR: Database failed to start after $MAX_ATTEMPTS attempts"
echo "=========================================="
echo ""
echo "Please check:"
echo "  1. Database container is running: docker-compose ps"
echo "  2. Database logs: docker-compose logs db"
echo "  3. Database health check: docker inspect aether_db"
echo ""
exit 1
