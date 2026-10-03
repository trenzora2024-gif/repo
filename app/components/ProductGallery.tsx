import {useCallback, useEffect, useRef, useState} from 'react';
import type {Image as ImageType} from '@shopify/hydrogen/storefront-api-types';
import {ProductMedia} from '~/components/ProductMedia';
import {CloseIcon} from '~/components/Icons';

type GalleryImage = Pick<ImageType, 'url' | 'altText' | 'width' | 'height'> & {
  id?: string | null;
};

/**
 * Product gallery: swipe on mobile (with a counter), editorial grid on
 * desktop, and a full-screen viewer with tap/click-to-zoom on every image.
 * Falls back to the design concept card when the product has no images.
 */
export function ProductGallery({
  images,
  handle,
  tags,
  title,
}: {
  images: GalleryImage[];
  handle: string;
  tags?: string[] | null;
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (!images.length) {
    return (
      <div className="gallery">
        <div className="gallery__track">
          <ProductMedia
            handle={handle}
            tags={tags}
            alt={`${title} — design concept`}
            loading="eager"
            sizes="(min-width: 960px) 55vw, 100vw"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="gallery" aria-label="Product images">
      <div className="gallery__track" ref={track} onScroll={onScroll}>
        {images.map((image, i) => (
          <button
            key={image.url}
            type="button"
            className="gallery__item"
            data-index={i}
            aria-label={`Zoom image ${i + 1} of ${images.length}`}
            onClick={() => setViewer(i)}
          >
            <ProductMedia
              image={image}
              handle={handle}
              alt={image.altText || `${title} — image ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              sizes="(min-width: 960px) 55vw, 100vw"
            />
          </button>
        ))}
      </div>
      {images.length > 1 ? (
        <p className="gallery__count" aria-hidden="true">
          <span>{String(index + 1).padStart(2, '0')}</span> /{' '}
          {String(images.length).padStart(2, '0')}
        </p>
      ) : null}
      {viewer !== null ? (
        <Viewer
          images={images}
          start={viewer}
          title={title}
          onClose={() => setViewer(null)}
        />
      ) : null}
    </div>
  );
}

function Viewer({
  images,
  start,
  title,
  onClose,
}: {
  images: GalleryImage[];
  start: number;
  title: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(start);
  const [zoom, setZoom] = useState<{x: number; y: number} | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = images[i];

  const go = useCallback(
    (step: number) => {
      setZoom(null);
      setI((current) => (current + step + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add('is-locked');
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      previous?.focus?.();
    };
  }, [go, onClose]);

  const point = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  return (
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — image ${i + 1} of ${images.length}`}
    >
      <button
        type="button"
        className="viewer__stage"
        data-zoomed={zoom ? 'true' : 'false'}
        aria-label={zoom ? 'Zoom out' : 'Zoom in'}
        onClick={(event) => setZoom(zoom ? null : point(event))}
        onPointerMove={(event) => {
          if (zoom) setZoom(point(event));
        }}
      >
        <img
          src={image.url}
          alt={image.altText || title}
          style={
            zoom
              ? {
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  transform: 'scale(2.2)',
                }
              : undefined
          }
        />
      </button>
      <div className="viewer__bar">
        <span className="viewer__count">
          {String(i + 1).padStart(2, '0')} /{' '}
          {String(images.length).padStart(2, '0')}
        </span>
        {images.length > 1 ? (
          <span className="viewer__nav">
            <button type="button" onClick={() => go(-1)} aria-label="Previous">
              ←
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next">
              →
            </button>
          </span>
        ) : null}
        <button
          ref={closeRef}
          type="button"
          className="icon-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
