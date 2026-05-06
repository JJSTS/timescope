import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/SearchBar.css';

type Tab = 'perfil' | 'usuarios' | 'tareas' | 'proyectos';

interface SearchResult {
  id: number;
  nombre: string;
  type: 'proyecto' | 'tarea' | 'organizacion';
  estado?: string;
}

interface Props {
  onNavigate: (tab: Tab, highlightId?: number) => void;
  onSelectOrg: (id: number) => void;
}

const BASE = 'http://localhost:8080/api/v1';

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  proyecto: 'Proyecto',
  tarea: 'Tarea',
  organizacion: 'Organización',
};

const SearchBar: React.FC<Props> = ({ onNavigate, onSelectOrg }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  const open = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const q = encodeURIComponent(query.trim());

      const [proyRes, orgRes, tarRes] = await Promise.allSettled([
        fetch(`${BASE}/proyectos?nombre=${q}&size=5`, { headers }).then(r => r.json()),
        fetch(`${BASE}/organizaciones?nombre=${q}&size=5`, { headers }).then(r => r.json()),
        fetch(`${BASE}/tareas?size=100`, { headers }).then(r => r.json()),
      ]);

      const combined: SearchResult[] = [];

      if (proyRes.status === 'fulfilled') {
        (proyRes.value?.content ?? []).slice(0, 5).forEach((p: any) =>
          combined.push({ id: p.id, nombre: p.nombre, type: 'proyecto', estado: p.estado })
        );
      }
      if (orgRes.status === 'fulfilled') {
        (orgRes.value?.content ?? []).slice(0, 5).forEach((o: any) =>
          combined.push({ id: o.id, nombre: o.nombre, type: 'organizacion' })
        );
      }
      if (tarRes.status === 'fulfilled') {
        const qLower = query.trim().toLowerCase();
        (tarRes.value?.content ?? [])
          .filter((t: any) => t.nombre?.toLowerCase().includes(qLower))
          .slice(0, 5)
          .forEach((t: any) =>
            combined.push({ id: t.id, nombre: t.nombre, type: 'tarea', estado: t.estado })
          );
      }

      setResults(combined);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'proyecto') onNavigate('proyectos', result.id);
    else if (result.type === 'tarea') onNavigate('tareas', result.id);
    else if (result.type === 'organizacion') onSelectOrg(result.id);
    close();
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div className="sb-container" ref={containerRef}>
      <button
        type="button"
        className={`sb-icon-btn ${isOpen ? 'sb-icon-btn--active' : ''}`}
        onClick={isOpen ? close : open}
        aria-label={isOpen ? 'Cerrar búsqueda' : 'Abrir búsqueda'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>

      <div className={`sb-input-wrapper ${isOpen ? 'sb-input-wrapper--open' : ''}`}>
        <input
          ref={inputRef}
          className="sb-input"
          type="text"
          placeholder="Buscar proyectos, tareas, organizaciones…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Buscar"
        />
        {loading && <span className="sb-spinner" />}
        {query && !loading && (
          <button type="button" className="sb-clear" onClick={() => setQuery('')} aria-label="Limpiar">
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="sb-dropdown">
          {results.length === 0 && !loading && (
            <div className="sb-empty">Sin resultados para "{query}"</div>
          )}
          {(['proyecto', 'tarea', 'organizacion'] as const).map(type => {
            const group = results.filter(r => r.type === type);
            if (group.length === 0) return null;
            return (
              <div key={type} className="sb-group">
                <div className="sb-group-label">{TYPE_LABEL[type]}s</div>
                {group.map(result => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="sb-result"
                    onClick={() => handleResultClick(result)}
                  >
                    <span className={`sb-badge sb-badge--${result.type}`}>
                      {TYPE_LABEL[result.type].charAt(0)}
                    </span>
                    <span className="sb-result-name">{result.nombre}</span>
                    {result.estado && (
                      <span className="sb-result-estado">{result.estado}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
