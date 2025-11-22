import { Card } from '@/components/ui/card';
import SmartImage from '../ui/SmartImage';
import { Badge } from '@/components/ui/badge';

export default function CategoryCard({
  title = 'Category',
  count = 0,
  src,
  thumb = null,
  ratio = 3 / 4,
  className = '',
  onClick = undefined,
}) {
  // basic runtime validation
  if (!src) {
    console.warn('CategoryCard: `src` prop is required. Rendering placeholder.');
  }

  return (
    <Card
      onClick={onClick}
      className={`overflow-hidden rounded-2xl shadow-md p-0 cursor-pointer group ${className}`}
    >
      {/* container that establishes aspect-ratio (tall card) */}
      <div className="relative w-full" style={{ paddingBottom: `${100 / (ratio || 1)}%` }}>
        {/* Image fills card */}
        <SmartImage
          src={src || '/lahore-city-pic.webp'}
          thumb={thumb || '/lahore-city-pic.webp'}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          imgClassName=""
          style={{ position: 'absolute', inset: 0 }}
          priority={false}
        />

        {/* subtle top-left content: title + count (matches provided design) */}
        <div className="absolute left-8 top-6 ">
          <div className={'flex flex-col items-start'}>
            <div className="text-3xl min-[425px]:text-2xl font-semibold leading-tight text-primary" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}>
              {title}
            </div>
            <Badge variant={"featured"} className="mt-2 text-sm min-[425px]:text-xs">{count} {count === 1 ? 'Property' : 'Properties'}</Badge>
          </div>
        </div>

        {/* optional top gradient to ensure legibility on very bright images */}
        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2), transparent)' }} />
      </div>
    </Card>
  );
}
