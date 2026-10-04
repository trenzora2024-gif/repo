import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {useLocation} from 'react-router';
import {CloseIcon} from '~/components/Icons';

export type DrawerType = 'cart' | 'search' | 'menu' | 'closed';

type DrawerContextValue = {
  type: DrawerType;
  open: (type: DrawerType) => void;
  close: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<DrawerType>('closed');
  const close = useCallback(() => setType('closed'), []);
  const value = useMemo(() => ({type, open: setType, close}), [type, close]);
  const {pathname} = useLocation();

  // Close any drawer on navigation.
  useEffect(() => {
    setType('closed');
  }, [pathname]);

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within <DrawerProvider>');
  return ctx;
}

/**
 * Accessible slide-over panel: modal dialog semantics, Esc to close, focus
 * moves into the panel on open and back to the trigger on close, page scroll
 * is locked while open. Closed drawers are `visibility: hidden`, so they are
 * out of the tab order and the accessibility tree.
 */
export function Drawer({
  type,
  title,
  side = 'right',
  children,
}: {
  type: Exclude<DrawerType, 'closed'>;
  title: ReactNode;
  side?: 'right' | 'left' | 'top';
  children: ReactNode;
}) {
  const {type: active, close} = useDrawer();
  const isOpen = active === type;
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    document.body.classList.add('is-locked');

    const panel = panelRef.current;
    const focusable = panel?.querySelector<HTMLElement>(
      '[data-autofocus], input, a[href], button:not([disabled])',
    );
    // Wait for the visibility transition to start so focus can land.
    const raf = requestAnimationFrame(() => focusable?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab' || !panel) return;
      const items = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      returnFocus.current?.focus?.();
    };
  }, [isOpen, close]);

  return (
    <div
      className={`drawer drawer--${side}${isOpen ? ' is-open' : ''}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="drawer__backdrop"
        tabIndex={-1}
        aria-label="Close"
        onClick={close}
      />
      <div
        ref={panelRef}
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="drawer__header">
          <h2 id={titleId} className="drawer__title">
            {title}
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={close}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
      </div>
    </div>
  );
}
