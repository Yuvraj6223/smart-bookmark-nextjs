# Smart Bookmark App Setup Script
Write-Host "🚀 Smart Bookmark App Setup Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vjwnvnkrhllslzmcyhuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ .env.local created. Please update with your Supabase anon key." -ForegroundColor Green
} else {
    Write-Host "✅ .env.local already exists." -ForegroundColor Green
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed." -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your Supabase anon key"
Write-Host "2. Run the database schema in Supabase SQL Editor (see database-schema.sql)"
Write-Host "3. Configure Google OAuth in Supabase and Google Console"
Write-Host "4. Add https://vjwnvnkrhllslzmcyhuy.supabase.co/auth/v1/callback to Google OAuth"
Write-Host "5. Run 'npm run dev' to start the development server"
Write-Host ""
Write-Host "📚 For detailed instructions, see README.md" -ForegroundColor Cyan
