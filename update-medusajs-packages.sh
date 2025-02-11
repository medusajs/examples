#!/bin/bash

# Navigate to the project directory
cd /Users/shahednasser/projects/examples

# Find all package.json files and update @medusajs/* packages to version 2.5.0
find . -name "package.json" -not -path "*/node_modules/*" | while read -r file; do
  # Extract @medusajs packages from package.json
  packages=$(jq -r '.dependencies, .devDependencies | keys[]' "$file" | grep '@medusajs/')
  
  # Navigate to the directory containing package.json
  dir=$(dirname "$file")
  cd "$dir"
  
  # Update each @medusajs package to version 2.5.0
  for package in $packages; do
    yarn upgrade "$package@2.5.0"
  done
  
  # Return to the project root directory
  cd - > /dev/null
done

echo "All @medusajs/* packages have been updated to version 2.5.0."
