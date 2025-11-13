#!/bin/bash

# L'Économe Pitmaster - Database Setup Script
# This script creates and initializes the PostgreSQL database

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="${DB_NAME:-pitmaster}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_postgres() {
    print_info "Checking PostgreSQL installation..."
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed or not in PATH"
        echo "Please install PostgreSQL: https://www.postgresql.org/download/"
        exit 1
    fi
    print_success "PostgreSQL found: $(psql --version)"
}

check_connection() {
    print_info "Testing database connection..."
    if PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; then
        print_success "Connected to PostgreSQL server"
        return 0
    else
        print_error "Cannot connect to PostgreSQL server"
        echo "Please check your connection settings:"
        echo "  Host: $DB_HOST"
        echo "  Port: $DB_PORT"
        echo "  User: $DB_USER"
        echo ""
        echo "You may need to set DB_PASSWORD environment variable:"
        echo "  export DB_PASSWORD='your_password'"
        exit 1
    fi
}

database_exists() {
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
}

create_database() {
    if database_exists; then
        print_warning "Database '$DB_NAME' already exists"
        read -p "Do you want to drop and recreate it? (yes/no): " response
        if [ "$response" = "yes" ]; then
            print_info "Dropping database '$DB_NAME'..."
            PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
            print_success "Database dropped"
        else
            print_info "Keeping existing database"
            return 0
        fi
    fi

    print_info "Creating database '$DB_NAME'..."
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
    print_success "Database '$DB_NAME' created"
}

run_schema() {
    print_info "Running schema.sql..."
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/schema.sql"
    print_success "Schema applied successfully"
}

run_seed() {
    print_info "Running seed.sql..."
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/seed.sql"
    print_success "Seed data loaded successfully"
}

show_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "Database setup complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Connection details:"
    echo "  Database: $DB_NAME"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo ""
    echo "Connection string:"
    echo "  postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    echo ""
    echo "Quick stats:"
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT
            (SELECT COUNT(*) FROM products) as products,
            (SELECT COUNT(*) FROM suppliers) as suppliers,
            (SELECT COUNT(*) FROM users) as users,
            (SELECT COUNT(*) FROM orders) as orders,
            (SELECT COUNT(*) FROM low_stock_products) as low_stock;
    "
    echo ""
    echo "Next steps:"
    echo "  1. Update your backend .env file with the connection string"
    echo "  2. Test the connection with: psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
    echo "  3. View low stock products: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c 'SELECT * FROM low_stock_products;'"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  L'Économe Pitmaster - Database Setup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Parse command line arguments
    SKIP_SEED=false
    FORCE=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-seed)
                SKIP_SEED=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --skip-seed    Skip loading seed data"
                echo "  --force        Force recreation without prompting"
                echo "  --help         Show this help message"
                echo ""
                echo "Environment variables:"
                echo "  DB_NAME        Database name (default: pitmaster)"
                echo "  DB_USER        Database user (default: postgres)"
                echo "  DB_PASSWORD    Database password (required)"
                echo "  DB_HOST        Database host (default: localhost)"
                echo "  DB_PORT        Database port (default: 5432)"
                echo ""
                echo "Example:"
                echo "  export DB_PASSWORD='mypassword'"
                echo "  ./setup.sh"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Run setup steps
    check_postgres
    check_connection
    create_database
    run_schema

    if [ "$SKIP_SEED" = false ]; then
        run_seed
    else
        print_warning "Skipping seed data (--skip-seed flag)"
    fi

    show_summary
}

# Run main function
main "$@"
