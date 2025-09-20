#!/bin/bash

# 🚀 EcoDash Buddy + EcoLearn - Netlify Deployment Script
# This script prepares and deploys the unified application to Netlify

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Building production application..."

# Clean previous build
if [ -d "dist" ]; then
    print_status "Cleaning previous build..."
    rm -rf dist
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build the application
print_status "Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed! No dist folder created."
    exit 1
fi

print_success "Build completed successfully!"

# Check build contents
print_status "Build contents:"
ls -la dist/

# Create deployment package
print_status "Creating deployment package..."
cd dist

# Create a zip file for easy upload
zip -r ../ecodash-buddy-unified.zip . -x "*.DS_Store" "*.git*"

cd ..

print_success "Deployment package created: ecodash-buddy-unified.zip"

# Display deployment instructions
echo ""
echo "🎉 ${GREEN}Deployment package ready!${NC}"
echo ""
echo "📦 ${BLUE}Files to deploy:${NC}"
echo "   • Upload the entire 'dist' folder to Netlify"
echo "   • Or use the zip file: ecodash-buddy-unified.zip"
echo ""
echo "🌐 ${BLUE}Next steps:${NC}"
echo "   1. Go to https://netlify.com"
echo "   2. Drag and drop the 'dist' folder"
echo "   3. Configure environment variables (see NETLIFY_DEPLOYMENT_PACKAGE.md)"
echo "   4. Update Firebase authorized domains"
echo ""
echo "📚 ${BLUE}Documentation:${NC}"
echo "   • Read NETLIFY_DEPLOYMENT_PACKAGE.md for detailed instructions"
echo "   • Check ROUTE_OPTIMIZATION_GUIDE.md for optimization setup"
echo ""
echo "🚛 ${BLUE}Route Optimization:${NC}"
echo "   • Deploy Python server separately (Heroku, Railway, etc.)"
echo "   • Update API URL in production"
echo "   • Use Admin Dashboard to create test data"
echo ""

# Check if Netlify CLI is available
if command -v netlify &> /dev/null; then
    print_status "Netlify CLI detected. You can also deploy with:"
    echo "   netlify deploy --prod --dir=dist"
    echo ""
fi

print_success "Deployment preparation complete! 🎉"
