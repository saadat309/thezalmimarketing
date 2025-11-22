/**
 * GlobalHero
 * - children: node to render inside hero
 * - color: background color
 * - navOffset: top padding so content doesn't hide under a sticky navbar
 */

// -----------------------------------------------------------------------------
// Example Usage:
// -----------------------------------------------------------------------------
// 1) Basic usage
// <GlobalHero color="var(--cream)" navOffset="64px">
//   <h1>Headline</h1>
// </GlobalHero>
//
// 2) Responsive navOffset
// <GlobalHero
//   navOffset="36px"
//   className="[--hero-nav-offset:36px] md:[--hero-nav-offset:72px]"
// >
//   <h1>Responsive Padding</h1>
// </GlobalHero>
//
// 3) Override wrapper classes
// <GlobalHero
//   contentWrapperClass="relative z-20 flex items-end px-6"
//   contentInnerClass="max-w-4xl text-left"
// >
//   <h1>Custom Layout</h1>
// </GlobalHero>
//
// 4) Add custom props to wrappers
// <GlobalHero
//   contentWrapperProps={{ id: 'hero-section', style: { minHeight: '60vh' } }}
//   contentInnerProps={{ 'data-role': 'hero-content' }}
// >
//   <p>Extra attributes applied.</p>
// </GlobalHero>
// ----------------------------------------------------------------------------

export function GlobalHero({  children,
  color = "rgba(252,255,241,1)",
  navOffset = "72px",
  className = "",
  contentWrapperClass = "relative z-10 w-full h-full",
  contentInnerClass = "w-full max-w-7xl pt-10 px-4",
  contentWrapperProps = {},
  contentInnerProps = {},
  ...rest }) {
  return (
    <section
      {...rest}
      className={`relative overflow-hidden h-[50vh] min-h-[280px] w-full ${className}`}
      style={{ backgroundColor: color }}
      aria-label="Hero section"
    >
      {/* Pattern layer with working CSS radial mask fade */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(#201a3b_1px,transparent_1px)] [background-size:30px_30px]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 70% at 50% 0%, black 0%, black 40%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 65% 70% at 50% 0%, black 0%, black 40%, transparent 100%)",
        }}
      />

       {/* Content wrapper - now controllable via props */}
      <div
        {...contentWrapperProps}
        className={contentWrapperClass}
        style={{ paddingTop: `var(--hero-nav-offset, ${navOffset})`, ...(contentWrapperProps.style || {}) }}
      >
        <div {...contentInnerProps} className={contentInnerClass}>
          {children}
        </div>
      </div>
    </section>
  );
}