export default function Footer() {
    return (
        <footer
            style={{
                borderTop: '1px solid var(--border-default)',
                padding: '20px 0',
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
            }}
        >
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
                <p>
                    © {new Date().getFullYear()} Smart Bookmarks. Built with{' '}
                    <a
                        href="https://nextjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
                    >
                        Next.js
                    </a>{' '}
                    &{' '}
                    <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
                    >
                        Supabase
                    </a>
                </p>
            </div>
        </footer>
    );
}
