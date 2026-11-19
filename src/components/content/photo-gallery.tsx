"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface GalleryPhoto { src: string; alt: string }

/** Grilla de fotos; al tocar una se abre en grande, con flechas (también del teclado) para pasar. */
export function PhotoGallery({ photos, label }: { photos: GalleryPhoto[]; label: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  const step = (delta: number) => setIndex((current) => (current === null ? null : (current + delta + photos.length) % photos.length));
  const photo = index === null ? null : photos[index];

  return (
    <>
      <div className="place-gallery content-gallery">
        {photos.map((item, i) => (
          <button key={item.src} type="button" className="gallery-item" onClick={() => setIndex(i)}>
            <Image src={item.src} alt={item.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 380px" />
            <span className="sr-only">Ver en grande</span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label={label}
        onClose={() => setIndex(null)}
        onClick={(event) => { if (event.target === event.currentTarget) setIndex(null); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        {photo && (
          <>
            <figure>
              <Image src={photo.src} alt={photo.alt} fill sizes="100vw" />
            </figure>
            <p className="lightbox-count" aria-live="polite">{index! + 1} de {photos.length}</p>
            <button type="button" className="lightbox-button lightbox-close" onClick={() => setIndex(null)} aria-label="Cerrar"><X /></button>
            {photos.length > 1 && (
              <>
                <button type="button" className="lightbox-button lightbox-prev" onClick={() => step(-1)} aria-label="Foto anterior"><ChevronLeft /></button>
                <button type="button" className="lightbox-button lightbox-next" onClick={() => step(1)} aria-label="Foto siguiente"><ChevronRight /></button>
              </>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
