import { ExternalLink, BadgeCheck } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const defaultFeatures = [
  {
    publication: 'Trendset Pakistan',
    publicationUrl: 'https://www.trendsetpakistan.com',
    postUrl: 'https://www.facebook.com/share/p/1ExqFUnQtb/',
    image: '/ch sajid.jpg',
    imageWidth: 1080,
    imageHeight: 1350,
    imageAlt: 'Trendset Pakistan feature on Ch. Sajid Mahmood, CEO of The Zalmi Marketing',
    headline: 'Meet Sajid Mahmood Ch, CEO of Zalmi Estate & Marketing',
    standfirst:
      'A DHA Lahore real estate consultant specializing in residential, commercial and investment opportunities.',
    body:
      'Trendset Pakistan profiled our founder on how a decade of ground-level DHA experience turned into a practice built on verified files, transparent pricing and long-term investment advice — for clients in Lahore and for overseas Pakistanis buying from six time zones away.',
    highlights: [
      'Investment advisor & DHA Lahore specialist',
      'Residential, commercial & plot file advisory',
      'Founder, The Zalmi Marketing — since 2020',
    ],
  },
  {
    publication: 'The Zalmi Marketing',
    publicationUrl: 'https://www.facebook.com/thezalmimarketing',
    postUrl: 'https://www.facebook.com/photo?fbid=122314326308237781&set=a.122107349600237781',
    image: '/ch-sajid-isp.jpg',
    imageWidth: 1080,
    imageHeight: 1350,
    imageAlt: 'Sajid Mahmood Ch - Trusted Real Estate Consultant in DHA Lahore, CEO of Zalmi Estate & Marketing',
    headline: 'Sajid Mahmood Ch — CEO of Zalmi Estate & Marketing | Trusted Real Estate Consultant in DHA Lahore',
    standfirst:
      'Sajid Mahmood Ch is the CEO of Zalmi Estate & Marketing and a professional real estate consultant specializing in the DHA Lahore property market.',
    body:
      'Through Zalmi Estate & Marketing, Sajid Mahmood Ch focuses on professional property consultancy, market guidance, and investment opportunities in DHA Lahore. His services are designed to help clients better understand available properties and make informed decisions according to their individual requirements.',
    highlights: [
      'CEO of Zalmi Estate & Marketing',
      'DHA Lahore property market specialist',
      'Professional property consultancy & market guidance',
    ],
  },
];

export default function FeaturedFeature({
  badge = 'In the press',
  heading = 'Recent press coverage',
  features = defaultFeatures,
}) {
  const whatsappUrl =
    'https://wa.me/923218446496?text=' +
    encodeURIComponent(
      'Hi Ch. Sajid Mahmood, I read your feature and would like to consult regarding real estate opportunities.'
    );

  return (
    <section
      aria-labelledby="press-feature-heading"
      className="relative overflow-hidden bg-[#0A0F1D] py-16 sm:py-24 lg:py-28"
    >
      {/* soft gold wash + grid, consistent with other dark sections (static background) */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-0 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400" aria-hidden="true" />
            <span className="text-xs sm:text-sm tracking-wide text-amber-400 font-medium uppercase">
              {badge}
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400" aria-hidden="true" />
          </div>
          <h2
            id="press-feature-heading"
            className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-white tracking-tight"
          >
            {heading}
          </h2>
        </motion.div>

        {/* Features Stack */}
        <div className="space-y-20 lg:space-y-28">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={feature.postUrl || feature.headline}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.15 }}
                className={`grid items-center gap-8 sm:gap-12 lg:gap-16 text-center lg:text-left ${
                  isEven
                    ? 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]'
                    : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]'
                }`}
              >
                {/* Press clipping (Figure) */}
                <figure
                  className={`group relative mx-auto w-full max-w-sm sm:max-w-md lg:mx-0 ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="absolute -inset-3 rounded-[1.75rem] border border-amber-500/15" aria-hidden="true" />
                  <a
                    href={feature.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-2xl gold-border-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1D]"
                  >
                    <img
                      src={feature.image || (isEven ? '/ch sajid.jpg' : '/ch-sajid-isp.jpg')}
                      alt={feature.imageAlt || `${feature.publication} feature on Ch. Sajid Mahmood`}
                      loading="lazy"
                      width={feature.imageWidth || 1080}
                      height={feature.imageHeight || 1350}
                      className="h-auto w-full transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.02]"
                    />
                  </a>
                  <figcaption className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
                    <BadgeCheck className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
                    Published by {feature.publication}
                  </figcaption>
                </figure>

                {/* Editorial copy */}
                <div
                  className={`flex flex-col items-center lg:items-start text-center lg:text-left ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <span className="h-px w-10 bg-gradient-to-r from-amber-400 to-transparent" aria-hidden="true" />
                    <span className="text-xs sm:text-sm tracking-wide text-amber-400 font-medium">
                      {feature.publication}
                    </span>
                  </div>

                  <h3 className="mt-4 sm:mt-5 font-display text-2xl sm:text-3xl lg:text-[2.25rem] leading-tight text-white tracking-tight">
                    {feature.headline}
                  </h3>

                  <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300 font-light">
                    {feature.standfirst}
                  </p>

                  <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-400 font-light">
                    {feature.body}
                  </p>

                  {feature.highlights && feature.highlights.length > 0 && (
                    <ul className="mt-6 sm:mt-8 grid gap-3 grid-cols-1 sm:grid-cols-2 w-full text-left">
                      {feature.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-400"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                    <a
                      href={feature.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full amber-gradient-vibrant px-6 py-3.5 font-medium text-[#0A0F1D] text-xs sm:text-sm transition-shadow duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1D] motion-reduce:transition-none"
                    >
                      Read the feature on Facebook
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/30 px-6 py-3.5 font-medium text-amber-200 text-xs sm:text-sm transition-colors duration-300 hover:border-amber-400/60 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1D] motion-reduce:transition-none"
                    >
                      Talk to Ch. Sajid Mahmood
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
