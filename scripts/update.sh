#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories to skip
SKIP_DIRS=(
    "express-checkout-storefront"
)

# Directories that need integration tests
INTEGRATION_TEST_DIRS=(
    "custom-item-price"
    "digital-products"
)

# Directories that should skip migrations
SKIP_MIGRATIONS_DIRS=(
    "migrate-from-magento"
    "wishlist-plugin"
)

# Function to print script messages
log() {
    local dir=$1
    local msg=$2
    echo -e "\n${BLUE}=== [$dir] $msg ===${NC}\n"
}

# Function to print success messages
success() {
    local dir=$1
    local msg=$2
    echo -e "\n${GREEN}✓ [$dir] $msg${NC}\n"
}

# Function to print warning messages
warning() {
    local dir=$1
    local msg=$2
    echo -e "\n${YELLOW}⚠ [$dir] $msg${NC}\n"
}

# Function to print error messages
error() {
    local dir=$1
    local msg=$2
    echo -e "\n${RED}✗ [$dir] $msg${NC}\n"
}

# Function to check if a directory should be skipped
should_skip() {
    local dir=$1
    local dirname=$(basename "$dir")
    for skip_dir in "${SKIP_DIRS[@]}"; do
        if [ "$dirname" = "$skip_dir" ]; then
            return 0
        fi
    done
    return 1
}

# Check if version argument is provided
if [ -z "$1" ]; then
    error "" "Please provide a version number"
    echo "Usage: ./update.sh <version> [start_directory] [-s|--single]"
    exit 1
fi

VERSION=$1
SINGLE_DIR=false
shift  # Remove version from arguments

# Parse remaining arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--single)
            SINGLE_DIR=true
            shift
            ;;
        *)
            if [ -z "$START_DIR" ]; then
                START_DIR=$1
            fi
            shift
            ;;
    esac
done

# Get the parent directory of the start directory
if [ -z "$START_DIR" ]; then
    # If no start directory provided, find the first non-hidden directory
    START_DIR=$(find . -maxdepth 1 -type d -not -path "*/\.*" -not -path "." | sort | head -n 1)
    if [ -z "$START_DIR" ]; then
        error "" "No valid directories found"
        exit 1
    fi
    PARENT_DIR="."
else
    PARENT_DIR=$(dirname "$START_DIR")
fi

log "" "Starting from directory: $START_DIR"
if [ "$SINGLE_DIR" = true ]; then
    log "" "Single directory mode: Only updating $START_DIR"
fi

# Function to handle errors
handle_error() {
    error "$1" "Error occurred in directory"
    warning "$1" "Last successful directory: $2"
    echo -e "To resume from this directory, run: ${YELLOW}./update.sh $VERSION $1${NC}"
    exit 1
}

# Function to process a directory
process_directory() {
    local dir=$1
    log "$dir" "Processing directory"
    
    # Change to the directory
    cd "$dir" || handle_error "$dir" "$LAST_SUCCESSFUL_DIR"
    
    # Check if package.json contains @medusajs dependencies
    if grep -q "\"@medusajs" package.json; then
        log "$dir" "Updating @medusajs packages to version $VERSION"
        
        # Update all @medusajs packages except @medusajs/ui
        echo -e "\n${YELLOW}[$dir] Running: yarn add ...${NC}\n"
        yarn add $(grep "\"@medusajs" package.json | grep -v "\"@medusajs/ui\"" | sed 's/.*"@medusajs\/\([^"]*\)".*/@medusajs\/\1@'"$VERSION"'/') || handle_error "$dir" "$LAST_SUCCESSFUL_DIR"
        
        # Trim empty lines from package.json
        echo -e "\n${YELLOW}[$dir] Trimming package.json...${NC}\n"
        # Remove all empty lines and ensure no trailing newline
        sed -i '' -e '/^[[:space:]]*$/d' package.json && \
        perl -i -pe 'chomp if eof' package.json || handle_error "$dir" "$LAST_SUCCESSFUL_DIR"
        
        # Check if this directory should skip migrations
        local dirname=$(basename "$dir")
        local parent_dir=$(basename "$(dirname "$dir")")
        local skip_migrations=false
        
        # Check if either the current directory or its parent is in SKIP_MIGRATIONS_DIRS
        for skip_dir in "${SKIP_MIGRATIONS_DIRS[@]}"; do
            if [ "$dirname" = "$skip_dir" ] || [ "$parent_dir" = "$skip_dir" ]; then
                skip_migrations=true
                warning "$dir" "Skipping migrations for this directory"
                break
            fi
        done
        
        # Run database migrations if not skipped
        if [ "$skip_migrations" = false ]; then
            log "$dir" "Running database migrations"
            echo -e "\n${YELLOW}[$dir] Running: npx medusa db:migrate${NC}\n"
            npx medusa db:migrate || handle_error "$dir" "$LAST_SUCCESSFUL_DIR"
        fi
        
        # Build the project
        log "$dir" "Building project"
        echo -e "\n${YELLOW}[$dir] Running: yarn build${NC}\n"
        yarn build || handle_error "$dir" "$LAST_SUCCESSFUL_DIR"
        
        # Check if this directory needs integration tests
        for test_dir in "${INTEGRATION_TEST_DIRS[@]}"; do
            if [ "$dirname" = "$test_dir" ]; then
                log "$dir" "Running integration tests"
                echo -e "\n${YELLOW}[$dir] Running: yarn test:integration:http${NC}\n"
                yarn test:integration:http || handle_error "$dir" "$LAST_SUCCESSFUL_DIR"
                
                echo -e "\n${YELLOW}[$dir] Running: yarn test:integration:modules${NC}\n"
                yarn test:integration:modules || handle_error "$dir" "$LAST_SUCCESSFUL_DIR"
                break
            fi
        done
        
        success "$dir" "Successfully updated and built"
    else
        warning "$dir" "No @medusajs packages found, skipping..."
    fi
    
    # Store the last successful directory
    LAST_SUCCESSFUL_DIR="$dir"
    
    # Return to the original directory
    cd - > /dev/null
}

# Create a temporary file to store directories
TEMP_DIRS=$(mktemp)

# Find and store all directories at the same level
find "$PARENT_DIR" -maxdepth 1 -type d -not -path "*/\.*" -not -path "$PARENT_DIR" | sort > "$TEMP_DIRS"

# Print the list of directories that will be processed
echo -e "\n${BLUE}=== Directories to be processed ===${NC}"
if [ ! -z "$START_DIR" ]; then
    echo -e "${YELLOW}Starting from directory: $START_DIR${NC}"
    echo -e "${YELLOW}Directories after $START_DIR:${NC}"
    while IFS= read -r dir; do
        if [ "$dir" = "$START_DIR" ]; then
            FOUND_START_DIR=true
        elif [ "$FOUND_START_DIR" = true ]; then
            echo -e "  - $dir"
        fi
    done < "$TEMP_DIRS"
else
    while IFS= read -r dir; do
        echo -e "  - $dir"
    done < "$TEMP_DIRS"
fi
echo -e "${BLUE}================================${NC}\n"

# Reset the found start directory flag
FOUND_START_DIR=false

# Store directories in an array
DIRS=()
while IFS= read -r dir; do
    DIRS+=("$dir")
done < "$TEMP_DIRS"

# Process each directory
for dir in "${DIRS[@]}"; do
    # If in single directory mode, only process the specified directory
    if [ "$SINGLE_DIR" = true ] && [ "$dir" != "$START_DIR" ]; then
        continue
    fi

    # If a start directory was specified and we haven't found it yet, check for it
    if [ ! -z "$START_DIR" ] && [ "$FOUND_START_DIR" = false ]; then
        if [ "$dir" = "$START_DIR" ]; then
            # Found the start directory, set a flag to start processing
            FOUND_START_DIR=true
        else
            # Haven't found the start directory yet, skip this directory
            continue
        fi
    fi
    
    # Skip if directory is in the skip list
    if should_skip "$dir"; then
        warning "$dir" "Directory is in skip list, skipping..."
        continue
    fi

    if [ -f "$dir/package.json" ]; then
        # Process the directory if it contains @medusajs dependencies
        if grep -q "\"@medusajs" "$dir/package.json"; then
            process_directory "$dir"
        fi
        
        # Check if this directory has a medusa subdirectory
        if [ -d "$dir/medusa" ] && [ -f "$dir/medusa/package.json" ]; then
            process_directory "$dir/medusa"
        fi
    fi
done

# Clean up temporary file
rm "$TEMP_DIRS"

success "" "All directories processed successfully!"
