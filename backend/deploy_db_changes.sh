#!/bin/bash

# Script to deploy database schema changes to a remote PostgreSQL instance

echo "============================================"
echo "   NCode Database Schema Deployment Tool"
echo "============================================"
echo ""

# Request credentials if not already set in environment
if [ -z "$DB_HOST" ]; then
    read -p "Enter Database Host IP: " DB_HOST
fi

if [ -z "$DB_USER" ]; then
    read -p "Enter Database User: " DB_USER
fi

if [ -z "$DB_NAME" ]; then
    read -p "Enter Database Name: " DB_NAME
fi

if [ -z "$DB_PASSWORD" ]; then
    read -s -p "Enter Database Password: " DB_PASSWORD
    echo ""
fi

# Export variables for the python script
export DB_HOST=$DB_HOST
export DB_USER=$DB_USER
export DB_PASSWORD=$DB_PASSWORD
export DB_NAME=$DB_NAME
export DB_PORT=${DB_PORT:-5432}

echo ""
echo "Deploying to $DB_HOST (Database: $DB_NAME)..."
echo ""

# Check if venv exists and activate it if needed
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Run the migration
python3 apply_migration_local.py

echo ""
echo "Done."
