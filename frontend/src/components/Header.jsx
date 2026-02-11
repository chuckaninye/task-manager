import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="app-header">
            <div className="app-header-inner">
            <Link to="/" className="app-header-brand">
                <span className="app-header-logo" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </span>
                <span className="app-header-title">Tidy</span>
            </Link>
            </div>
        </header>
    );
}

export default Header;
