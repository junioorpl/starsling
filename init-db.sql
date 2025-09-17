-- Initialize the database
-- Database is already created by POSTGRES_DB environment variable

-- Create the starsling user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'starsling') THEN
        CREATE ROLE starsling WITH LOGIN PASSWORD 'starsling_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE starsling TO starsling;
