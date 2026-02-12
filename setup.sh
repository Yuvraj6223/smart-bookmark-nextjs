#!/bin/bash

echo "🚀 Smart Bookmark App Setup Script"
echo "=================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vjwnvnkrhllslzmcyhuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOL
    echo "✅ .env.local created. Please update with your Supabase anon key."
else
    echo "✅ .env.local already exists."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed."
else
    echo "✅ Dependencies already installed."
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Update .env.local with your Supabase anon key"
echo "2. Run the database schema in Supabase SQL Editor (see database-schema.sql)"
echo "3. Configure Google OAuth in Supabase and Google Console"
echo "4. Add https://vjwnvnkrhllslzmcyhuy.supabase.co/auth/v1/callback to Google OAuth"
echo "5. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For detailed instructions, see README.md"
