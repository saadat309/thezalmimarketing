import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Calculator, Menu, Moon, Sun, X } from 'lucide-react';

const links = [
  ['Home', '/'], ['Properties', '/properties'], ['Maps', '/maps'],
  ['Files', '/files'], ['About Us', '/about'], ['Contact Us', '/contact'],
];

export default function StagingNavbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const initialDark = window.localStorage.getItem('theme') !== 'light';
    setDark(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    window.localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  }

  return (
    <header className={`staging-site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="staging-nav-inner">
        <Link to="/" className="staging-site-logo" aria-label="The Zalmi Marketing home">
          <img src={dark ? '/Zalmi Marketing Logo White.webp' : '/Zalmi Marketing Logo Black.webp'} alt="The Zalmi Marketing" />
        </Link>
        <nav className="staging-desktop-nav" aria-label="Primary navigation">
          {links.map(([label, to]) => <Link key={to} to={to} activeProps={{ className: 'active' }}>{label}</Link>)}
          <Link to="/calculator" className="staging-nav-calculator"><Calculator size={15} /> Zalmi Calculator</Link>
        </nav>
        <div className="staging-nav-actions">
          <button type="button" className="staging-theme-button" aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`} onClick={toggleTheme}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button type="button" className="staging-menu-button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {open && <nav className="staging-mobile-nav" aria-label="Mobile navigation">{links.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>)}<Link to="/calculator" onClick={() => setOpen(false)}>Zalmi Calculator</Link></nav>}
    </header>
  );
}
