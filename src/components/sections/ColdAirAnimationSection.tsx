import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const snowflakes = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: Math.random() * 90 + 5,
  delay: Math.random() * 6,
  duration: 5 + Math.random() * 4,
  size: 8 + Math.random() * 8,
  drift: (Math.random() - 0.5) * 80,
}));

const airWaves = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  delay: i * 1,
  width: 120 + i * 40,
}));

export function ColdAirAnimationSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-20 md:py-28"
      style={{
        background: 'linear-gradient(180deg, hsl(200 60% 96%) 0%, hsl(195 70% 90%) 40%, hsl(190 65% 85%) 100%)',
      }}
    >
      {/* Snowflake particles */}
      {snowflakes.map((s) => (
        <div
          key={s.id}
          className={cn('absolute rounded-full opacity-0', isVisible && 'ac-snowfall')}
          style={{
            left: `${s.left}%`,
            top: '10%',
            width: s.size,
            height: s.size,
            background: 'radial-gradient(circle, white 0%, hsl(200 90% 95%) 100%)',
            boxShadow: '0 0 8px 2px hsl(190 80% 85% / 0.8)',
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            ['--drift' as string]: `${s.drift}px`,
          }}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center">
          {/* AC Unit SVG */}
          <div className={cn('relative mb-8 reveal-scale-hidden', isVisible && 'reveal-scale-visible')}>
            <svg
              viewBox="0 0 320 140"
              className="w-64 md:w-80 lg:w-96 drop-shadow-xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* AC body */}
              <rect x="10" y="10" width="300" height="100" rx="12" fill="hsl(224, 41%, 29%)" />
              <rect x="10" y="10" width="300" height="100" rx="12" stroke="hsl(224, 41%, 35%)" strokeWidth="2" />

              {/* Top panel line */}
              <rect x="20" y="18" width="280" height="6" rx="3" fill="hsl(224, 41%, 35%)" />

              {/* Brand badge */}
              <rect x="125" y="30" width="70" height="18" rx="4" fill="hsl(27, 91%, 55%)" />
              <text x="160" y="43" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" fontFamily="sans-serif">
                PURE
              </text>

              {/* Vent slats */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <rect
                  key={i}
                  x="30"
                  y={56 + i * 7}
                  width="260"
                  height="3"
                  rx="1.5"
                  fill="hsl(224, 30%, 22%)"
                  className={cn(isVisible && 'ac-frost-shimmer')}
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
              ))}

              {/* Bottom edge / drip tray */}
              <rect x="15" y="108" width="290" height="4" rx="2" fill="hsl(186, 54%, 71%)" />
            </svg>

            {/* Air flow waves */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              {airWaves.map((w) => (
                <div
                  key={w.id}
                  className={cn('opacity-0', isVisible && 'ac-airflow')}
                  style={{
                    width: w.width,
                    height: 3,
                    borderRadius: '50%',
                    background: `linear-gradient(90deg, transparent 0%, hsl(190 70% 80% / 0.7) 30%, hsl(186 54% 71% / 0.5) 70%, transparent 100%)`,
                    animationDelay: `${w.delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Frost glow behind unit */}
            <div
              className={cn(
                'absolute inset-0 -inset-x-8 -inset-y-4 rounded-2xl opacity-0 pointer-events-none',
                isVisible && 'ac-frost-glow'
              )}
              style={{
                background: 'radial-gradient(ellipse at center 70%, hsl(190 80% 85% / 0.5) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Thermometer */}
          <div className={cn('flex items-center gap-3 mb-8 reveal-hidden', isVisible && 'reveal-visible')} style={{ transitionDelay: '0.3s' }}>
            <div className="relative w-6 h-20 rounded-full border-2 border-secondary overflow-hidden bg-white/60">
              <div
                className={cn('absolute bottom-0 left-0 right-0 rounded-full transition-all duration-[4s] ease-out', isVisible ? 'h-[30%]' : 'h-[90%]')}
                style={{
                  background: isVisible
                    ? 'linear-gradient(to top, hsl(190 70% 65%), hsl(200 80% 80%))'
                    : 'linear-gradient(to top, hsl(0 75% 55%), hsl(27 91% 55%))',
                  transitionDelay: '0.5s',
                }}
              />
              {/* Bulb at bottom */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-secondary" style={{ background: isVisible ? 'hsl(190, 70%, 65%)' : 'hsl(0, 75%, 55%)', transition: 'background 4s ease-out 0.5s' }} />
            </div>
            <span className={cn('text-sm font-semibold transition-colors duration-[4s]', isVisible ? 'text-secondary-foreground' : 'text-destructive')} style={{ transitionDelay: '0.5s' }}>
              {isVisible ? '68°F' : '95°F'}
            </span>
          </div>

          {/* Headline + CTA */}
          <h2
            className={cn(
              'text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight text-primary reveal-hidden',
              isVisible && 'reveal-visible'
            )}
            style={{ transitionDelay: '0.4s' }}
          >
            Stay Cool With Pure Heating & Air
          </h2>
          <p
            className={cn(
              'mt-4 text-lg text-muted-foreground text-center max-w-xl reveal-hidden',
              isVisible && 'reveal-visible'
            )}
            style={{ transitionDelay: '0.55s' }}
          >
            Expert AC installation, repair & maintenance to keep your home perfectly comfortable all year round.
          </p>
          <div
            className={cn('mt-8 reveal-scale-hidden', isVisible && 'reveal-scale-visible')}
            style={{ transitionDelay: '0.7s' }}
          >
            <Button asChild size="lg" className="animate-pulse-ring">
              <Link to="/contact">Get a Free Quote</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
