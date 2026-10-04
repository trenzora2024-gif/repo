import type {ArtIcon} from '~/data/catalog';

/**
 * Line-drawn product glyph on a brand tone. Shown wherever a Shopify image
 * is missing (and in the local mock), so pages never render empty boxes.
 */
const PATHS: Record<ArtIcon, string> = {
  tent: 'M3 20 12 4l9 16H3Z M12 4v16 M9 20l3-6 3 6',
  bell: 'M3 19c2-5 5-11 9-15 4 4 7 10 9 15H3Z M12 4v15 M10 19l2-4 2 4',
  awning: 'M3 9h13l5 4H8L3 9Z M4 9v10 M16 9v10 M20 13v6 M3 19h18',
  cot: 'M3 11h18 M3 11v2h18v-2 M5 13l-2 6 M19 13l2 6 M8 13l4 6 M16 13l-4 6',
  bag: 'M5 20V8a7 7 0 0 1 14 0v12H5Z M5 13h14 M9 6h6',
  table: 'M3 9h18 M5 9v11 M19 9v11 M5 14h14 M8 6h8v3H8z',
  fridge: 'M4 8h16v11H4z M4 12h16 M8 8V5h8v3 M7 15h3',
  pot: 'M4 10h16v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7Z M2 10h20 M9 7c0-1 1-2 1-3 M14 7c0-1 1-2 1-3',
  shower: 'M6 21V6a3 3 0 0 1 6 0 M9 9h6l-1 2h-4l-1-2 M10 14v1 M12 14v2 M14 14v1',
  water: 'M6 6h12v14H6z M9 6V3h6v3 M18 12h3v3h-3 M9 11h6',
  chair: 'M6 4h12l-2 9H8L6 4Z M5 13h14 M7 13l-3 7 M17 13l3 7 M9 13l6 7 M15 13l-6 7',
  stove: 'M5 11h12v8H5z M8 19v2 M14 19v2 M14 11V3h3v8 M8 15h4',
  fire: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 2 3 4V3Z M4 21h16',
  heater: 'M7 4h10v13H7z M9 8h6 M9 11h6 M9 14h6 M9 17l-2 4 M15 17l2 4',
  battery: 'M4 7h14v12H4z M18 11h2v4h-2 M11 9l-2 4h4l-2 4',
  solar: 'M3 7h18l-2 9H5L3 7Z M12 7v9 M4 11.5h16 M12 16v4 M8 20h8',
  lantern: 'M9 3h6 M12 3v2 M8 5h8l1 3v9l-1 3H8l-1-3V8l1-3Z M7 8h10 M7 17h10 M12 11v3',
  wagon: 'M3 8h18l-2 8H5L3 8Z M5 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0 M15 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0 M21 8l1-3',
  box: 'M3 8h18v12H3z M2 5h20v3H2z M10 12h4',
  axe: 'M5 21 16 10 M14 4l6 6-3 3-6-6 3-3Z',
  toilet: 'M6 3h7v7H6z M5 10h12a6 6 0 0 1-6 6H8a3 3 0 0 1-3-3v-3Z M8 16l-1 5h8l-1-5',
  privacy: 'M5 21V6l7-3 7 3v15 M5 21h14 M12 3v18 M9 12h1 M14 12h1',
};

export function Glyph({icon, className}: {icon: ArtIcon; className?: string}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[icon]} />
    </svg>
  );
}

export function ProductArt({
  icon = 'tent',
  tone = 'sand',
  label,
}: {
  icon?: ArtIcon;
  tone?: string;
  label?: string;
}) {
  return (
    <div
      className={`art tone-${tone}`}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <Glyph icon={icon} />
    </div>
  );
}
