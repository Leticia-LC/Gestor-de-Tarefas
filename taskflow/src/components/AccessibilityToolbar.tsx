"use client";

import { useEffect, useState } from "react";

const VLIBRAS_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";

function loadVlibras(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject();
    if ((window as any).VLibras) return resolve();

    const s = document.createElement("script");
    s.src = VLIBRAS_URL;
    s.async = true;
    s.onload = () => {
      try {
        // init
        if ((window as any).VLibras) {
          new (window as any).VLibras.Widget("https://vlibras.gov.br/app");
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function AccessibilityToolbar() {
  const [vlibrasActive, setVlibrasActive] = useState<boolean>(() => !!(typeof window !== 'undefined' && (window as any).__vlibras_enabled));
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [highContrast, setHighContrast] = useState<boolean>(() => typeof window !== 'undefined' && !!localStorage.getItem("a11y:highContrast"));
  const [largeText, setLargeText] = useState<boolean>(() => typeof window !== 'undefined' && !!localStorage.getItem("a11y:largeText"));
  const [dyslexicFont, setDyslexicFont] = useState<boolean>(() => typeof window !== 'undefined' && !!localStorage.getItem("a11y:dyslexic"));
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => typeof window !== 'undefined' && !!localStorage.getItem("a11y:reduceMotion"));

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('a11y-high-contrast', highContrast);
    document.documentElement.classList.toggle('a11y-large-text', largeText);
    document.documentElement.classList.toggle('a11y-dyslexic', dyslexicFont);
    document.documentElement.classList.toggle('a11y-reduce-motion', reduceMotion);

    try { if (highContrast) localStorage.setItem('a11y:highContrast', '1'); else localStorage.removeItem('a11y:highContrast'); } catch {}
    try { if (largeText) localStorage.setItem('a11y:largeText', '1'); else localStorage.removeItem('a11y:largeText'); } catch {}
    try { if (dyslexicFont) localStorage.setItem('a11y:dyslexic', '1'); else localStorage.removeItem('a11y:dyslexic'); } catch {}
    try { if (reduceMotion) localStorage.setItem('a11y:reduceMotion', '1'); else localStorage.removeItem('a11y:reduceMotion'); } catch {}
  }, [highContrast, largeText, dyslexicFont, reduceMotion]);

  useEffect(() => {
    if (vlibrasActive) {
      // load only once and mark flag on window
      if (typeof window !== 'undefined' && (window as any).VLibras) {
        (window as any).__vlibras_enabled = true;
        return;
      }
      setStatusMessage('Carregando VLibras — aguarde...');
      loadVlibras()
        .then(() => {
          (window as any).__vlibras_enabled = true;
          setVlibrasActive(true);
          setStatusMessage('VLibras ativado');
        })
        .catch((err) => { console.error('VLibras load failed', err); setVlibrasActive(false); setStatusMessage('Falha ao carregar VLibras'); });
    } else {
      // Optionally remove widget elements if present — VLibras provides a floating button element.
      if (typeof document !== 'undefined') {
        // Try to remove any injected VLibras elements and scripts. The widget
        // may use multiple class names or an injected script tag; remove the
        // script and any nodes that reference "vlibras" in id/class names.
        const nodes = Array.from(document.querySelectorAll('[id*="vlibras"], [class*="vlibras"], script[src*="vlibras"]'));
        nodes.forEach((n) => n.remove());

        // Some versions might append a container in the body with a different
        // structure — scan the document for anything with 'vlibras' in dataset
        // attributes as well.
        const fuzzy = Array.from(document.querySelectorAll('[data-vlibras], [data-plugin*="vlibras"]'));
        fuzzy.forEach((n) => n.remove());

        // If the plugin exposed a global instance, attempt to call a cleanup
        // method if available and remove the flag.
        try {
          if ((window as any).VLibras && typeof (window as any).VLibras.destroy === 'function') {
            try { (window as any).VLibras.destroy(); } catch {}
          }
          delete (window as any).__vlibras_enabled;
        } catch {}

        setStatusMessage('VLibras desativado');
      }
    }
  }, [vlibrasActive]);

  // announce toggle changes in an accessible way
  useEffect(() => {
    if (highContrast) setStatusMessage('Alto contraste ativado');
    else if (!highContrast) setStatusMessage('Alto contraste desativado');
  }, [highContrast]);

  useEffect(() => {
    if (largeText) setStatusMessage('Texto maior ativado');
    else if (!largeText) setStatusMessage('Texto maior desativado');
  }, [largeText]);

  useEffect(() => {
    if (dyslexicFont) setStatusMessage('Fonte disléxica ativada');
    else if (!dyslexicFont) setStatusMessage('Fonte disléxica desativada');
  }, [dyslexicFont]);

  useEffect(() => {
    if (reduceMotion) setStatusMessage('Reduzir movimento ativado');
    else if (!reduceMotion) setStatusMessage('Reduzir movimento desativado');
  }, [reduceMotion]);

  return (
    <div aria-hidden="false" className="accessibility-toolbar p-2 bg-white border-b flex gap-3 items-center justify-between">
      <div className="flex items-center gap-3">
        <a href="#main-content" className="skip-link text-xs px-2 py-1 rounded border" aria-label="Pular para o conteúdo principal">Pular para conteúdo</a>

        <div className="a11y-toggle-group flex items-center gap-2 text-sm">
          <label className="inline-flex items-center gap-2" title="VLibras - Intérprete em Libras">
            <input aria-label="Ativar VLibras" type="checkbox" checked={vlibrasActive} onChange={(e) => setVlibrasActive(e.target.checked)} />
            VLibras
          </label>

          <label title="Alto contraste" className="inline-flex items-center gap-2">
            <input aria-label="Ativar alto contraste" type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
            Alto contraste
          </label>

          <label title="Texto maior" className="inline-flex items-center gap-2">
            <input aria-label="Ativar texto maior" type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} />
            Texto maior
          </label>

          <label title="Fonte para dislexia" className="inline-flex items-center gap-2">
            <input aria-label="Ativar fonte para dislexia" type="checkbox" checked={dyslexicFont} onChange={(e) => setDyslexicFont(e.target.checked)} />
            Fonte (dislexia)
          </label>

          <label title="Reduzir movimento/animações" className="inline-flex items-center gap-2">
            <input aria-label="Reduzir movimento" type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
            Reduzir movimento
          </label>
        </div>
      </div>

      <div className="text-xs text-gray-500">Acessibilidade — recursos: VLibras, Alto Contraste, Texto Maior, Fonte Disléxica, Reduzir Movimento</div>
      {/* aria-live region to announce changes for screen readers */}
      <div aria-live="polite" className="sr-only" role="status">{statusMessage}</div>
    </div>
  );
}
