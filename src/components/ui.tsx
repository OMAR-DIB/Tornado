import { useEffect, useState, type AnchorHTMLAttributes, type ImgHTMLAttributes } from 'react';
import { whatsappLink, whatsappReady } from '../lib/config';

export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.2-1.36A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.08.8.82-3-.2-.31a8.2 8.2 0 1 1 6.94 3.83Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.55-.42h-.47a.9.9 0 0 0-.66.3c-.22.25-.86.85-.86 2.06s.88 2.39 1 2.55c.13.17 1.74 2.65 4.2 3.72.6.25 1.05.4 1.41.52.6.18 1.13.16 1.56.1.48-.08 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

type WaProps = AnchorHTMLAttributes<HTMLAnchorElement> & { message: string };
/** Opens WhatsApp with a prepared message. Hidden until a real number is set. */
export function WhatsAppLink({ message, children, ...rest }: WaProps) {
  if (!whatsappReady) return null;
  return <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
}

/** Image that swaps to a plain placeholder if the file is missing. */
export function Photo({ src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <span className="photo-missing" role="img" aria-label={alt}>No photo yet</span>;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} {...rest} />;
}

export function Brand() {
  return (
    <span className="brand">
      <img src="/logo-ah.png" alt="" width={77} height={42} />
      <span className="brand-text"><b>AL HAJ</b><span>TORNADO agent</span></span>
    </span>
  );
}

export function useTitle(title?: string) {
  useEffect(() => { document.title = title ? `${title} | AL HAJ` : 'AL HAJ | TORNADO home appliances'; }, [title]);
}
