
import React, { useRef, useState, useEffect } from 'react';

/**
 * Props
 *  - src (string)                 REQUIRED
 *  - alt (string)                 REQUIRED
 *  - thumb (string?)              optional
 *  - placeholder (node?)          optional custom placeholder node (overrides thumb/gradient)
 *  - ratio (number?)              optional, width/height (e.g. 16/9)
 *  - detectRatio (boolean)        if true, auto detect parent ratio when ratio not provided
 *  - priority (boolean)           if true, skip lazy and load immediately (like next/image priority)
 *  - showSkeleton (boolean)       show neutral skeleton until image loads
 *  - rootMargin (string)          IO margin (default '300px')
 *  - srcSet (string?)             optional srcset
 *  - sizes (string?)              optional sizes
 *  - loading ('lazy'|'eager')     default 'lazy'
 *  - progressCallback (fn?)       receives progress percent 0..100 if supported
 *  - onLoad (fn?)                 called after image fully loads
 *  - onError (fn?)                called on error
 *  - className, imgClassName, style, ...rest
 */

export default function SmartImage({
  src,
  alt = '',
  thumb = null,
  placeholder = null,
  ratio = null,
  detectRatio = false,
  priority = false,
  showSkeleton = false,
  rootMargin = '300px',
  srcSet = null,
  sizes = null,
  width = null,
  height = null,
  loading = 'lazy',
  progressCallback = null,
  errorPlaceholder = null,
  onLoad = null,
  onError = null,
  className = '',
  imgClassName = '',
  style = {},
  ...rest
}) {
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [autoRatio, setAutoRatio] = useState(ratio || null);
  const [blobSrc, setBlobSrc] = useState(null);

  // Auto-detect parent ratio if requested
  useEffect(() => {
    if (!detectRatio || ratio) return;
    const el = wrapperRef.current && wrapperRef.current.parentElement;
    if (!el) return;
    // use ResizeObserver to compute ratio of parent
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width && height) setAutoRatio(width / height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [detectRatio, ratio]);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (priority) {
    queueMicrotask(() => setInView(true));  // <-- FIX
    return;
  }
 // priority loads immediately
    if (!wrapperRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { rootMargin }
    );
    io.observe(wrapperRef.current);
    return () => io.disconnect();
  }, [rootMargin, priority]);

  // If progressCallback is provided, attempt streaming download to measure progress
  useEffect(() => {
    if (!inView || !progressCallback) return;
    // try readable stream approach
    let canceled = false;
    (async () => {
      try {
        const res = await fetch(src, { mode: 'cors' });
        if (!res.ok || !res.body) {
          // fallback: let <img> load normally
          progressCallback(100);
          return;
        }
        const contentLength = res.headers.get('Content-Length');
        if (!contentLength) {
          progressCallback(50); // unknown size
        }
        const total = contentLength ? parseInt(contentLength, 10) : null;
        const reader = res.body.getReader();
        let received = 0;
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (canceled) { reader.cancel(); return; }
          chunks.push(value);
          received += value.length;
          if (total) progressCallback(Math.min(100, Math.round((received / total) * 100)));
          else progressCallback(Math.min(99, Math.round((received / 1024) / 10))); // heuristic
        }
        // assemble blob and create object url to use as image src (prevents double download in some browsers)
        const blob = new Blob(chunks);
        const objectUrl = URL.createObjectURL(blob);
        if (!canceled) setBlobSrc(objectUrl);
      } catch (e) {
        // streaming not supported or blocked; fallback to native load
        progressCallback(0);
      }
    })();
    return () => { canceled = true; };
  }, [inView, src, progressCallback]);

  // wrapper style: use ratio if available else inherit height from parent
  const wrapperStyle = (autoRatio && autoRatio > 0)
    ? { position: 'relative', width: '100%', paddingBottom: `${100 / autoRatio}%`, overflow: 'hidden', ...style }
    : (!ratio && !autoRatio)
      ? { position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }
      : { position: 'relative', width: '100%', paddingBottom: `${100 / ratio}%`, overflow: 'hidden', ...style };

  // cleanup blob url on unmount/when replaced
  useEffect(() => {
    return () => { if (blobSrc) URL.revokeObjectURL(blobSrc); };
  }, [blobSrc]);

  // handlers
  const handleLoad = (e) => {
    setLoaded(true);
    if (progressCallback) progressCallback(100);
    if (onLoad) onLoad(e);
  };
  const handleError = (e) => {
    setErrored(true);
    if (onError) onError(e);
  };

  // choose final src (if streaming created blob use it)
  const finalSrc = blobSrc || src;

  return (
    <div ref={wrapperRef} className={`smart-image-wrapper ${className}`} style={wrapperStyle} aria-busy={!loaded}>
      {/* custom placeholder node */}
      {placeholder ? (
        !loaded && !errored && <div className="si-placeholder-wrapper" style={{ position: 'absolute', inset: 0 }}>{placeholder}</div>
      ) : (
        // thumb or gradient placeholder
        thumb
          ? (!loaded && !errored && <img src={thumb} alt={alt} aria-hidden="true" className="si-thumb" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />)
          : (!loaded && !errored && <div className="si-placeholder" style={{ position: 'absolute', inset: 0 }} />)
      )}

      {/* skeleton overlay */}
      {showSkeleton && !loaded && !errored && <div className="si-skeleton" style={{ position: 'absolute', inset: 0 }} />}

      {/* actual image */}
      {(inView || priority) && !errored && (
        <img
          ref={imgRef}
          src={finalSrc}
          srcSet={srcSet || undefined}
          sizes={sizes || undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          className={`si-image ${loaded ? 'si-visible' : 'si-hidden'} ${imgClassName}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          {...rest}
        />
      )}

      {/* error fallback */}
      {errored && (
        <div className="si-error" role="img" aria-label={alt || 'image error'} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          {errorPlaceholder || <span>Image failed to load</span>}
        </div>
      )}
    </div>
  );
}
