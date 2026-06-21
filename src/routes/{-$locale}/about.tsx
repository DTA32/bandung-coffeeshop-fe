import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Breadcrumb from '@/components/Breadcrumb'
import Image from '@/components/Image'
import { useLocale } from '@/lib/locale'
import {
  seoHead,
  localizedPath,
  aboutCrumbs,
  breadcrumbJsonLd,
} from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { createI18n, normalizeLocale } from '@/i18n'

export const Route = createFileRoute('/{-$locale}/about')({
  head: (ctx: any) => {
    const locale = normalizeLocale(ctx.params.locale)
    const i18n = createI18n(locale)
    const seo: SeoMeta = {
      title: i18n.t('seo.aboutTitle'),
      description: i18n.t('seo.aboutDesc'),
      canonicalPath: localizedPath(locale, '/about'),
      jsonLd: [breadcrumbJsonLd(aboutCrumbs((k) => i18n.t(k), locale))],
    }
    return seoHead(seo)
  },
  component: About,
})

function About() {
  const { t } = useTranslation()
  const locale = useLocale()
  return (
    <main className="flex-1 md:px-8 py-12">
      <div className="mx-auto max-w-3xl px-6 sm:px-8 mb-4">
        <Breadcrumb items={aboutCrumbs(t, locale)} />
      </div>
      <section className="mx-auto max-w-3xl rounded-2xl p-6 sm:p-8 text-forest flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="font-semibold">About BDGCafé ☕️</h1>
          <p className="text-lg text-bark">
            BDGCafé is a personal guide to the best cafés in Bandung created
            by&nbsp;
            <a className="font-medium" href={'https://mraditya.my.id'}>
              DTA32
            </a>
            , handpicked for getting work done, hanging out with friends, or
            simply finding a good cup of coffee and a quiet corner to call your
            own.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Why BDGCafé exists</h2>
          <div className="flex flex-col text-bark gap-2">
            <p>
              This website comes from my own need to find cafés that fit the
              moment in Bandung. Some days I need a quiet café with fast wifi to
              work. Other days I want a lively spot with good meals to hang out
              with friends. And sometimes I just want good coffee and a nice
              atmosphere to unwind.
            </p>
            <p>
              Finding the right one used to mean scrolling through my Google
              Maps list and re-reading the reviews I&apos;d written, then
              scrolling all over again whenever I needed a café in a specific
              area.
            </p>
            <p>
              It got worse when meeting friends. To search for the fairest spot
              for everyone, I&apos;d look up the midpoint on some old website
              that only shows the point itself (no cafe recommendations), then
              search for cafés around it and start re-reading reviews from
              scratch.
            </p>
            <p>
              All of this was time-consuming and inefficient. So I built BDGCafé
              to make finding the right café in Bandung easier for me, and for
              anyone who needs the same thing.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-semibold">
            So, how can this web helps me find cafe?
          </h2>
          <ul className="space-y-4">
            <li>
              <h3 className="font-semibold text-forest">
                Explore by district, area, or current location
              </h3>
              <p className="text-bark">
                Currently in a specific neighborhood or near a landmark, and
                want to find a café nearby? Filter cafés by location and find
                the perfect spot without hassle.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-forest">
                Work-from-café scores
              </h3>
              <p className="text-bark">
                Need to get work done but not sure if a café can keep up? Check
                its work-from-café score for wifi speed, outlets, and room to
                focus before you head out.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-forest">Meet in the Middle</h3>
              <p className="text-bark">
                Planning for hangout with friends who lives across town? Drop a
                pin for each of you and discover great cafés right at the
                midpoint, so no more "too far for me" excuses.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-forest">
                Know the price before you go
              </h3>
              <p className="text-bark">
                Watching your budget? Each café lists price ranges for coffee,
                snacks, and meals, so there are no surprises when the bill
                arrives.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-forest">
                Hours, tags, and quick facts
              </h3>
              <p className="text-bark">
                Not sure if it&apos;s open or worth the trip? Check opening
                hours, tags, and quick facts on each café&apos;s page before you
                head out.
              </p>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Honest, subjective reviews</h2>
          <div className="flex flex-col text-bark gap-1">
            <p>
              Every café is reviewed and rated across the things that actually
              matter: price, vibe, noise, wifi speed, meals, atmosphere, and
              parking. Scores reflect a single visit and personal taste, so
              treat them as a friend&apos;s recommendation, not a final verdict.
              Your experience may vary, and that&apos;s perfectly fine.
            </p>
            <p>
              If you don&apos;t believe that these all are from my experiences,
              can take a look at my Google Maps list that listed cafes&nbsp;
              <a
                className="font-medium underline underline-offset-2"
                href={'https://maps.app.goo.gl/3Qbn97jVgUFfaniH8'}
              >
                for WFC
              </a>
              &nbsp;and&nbsp;
              <a
                className="font-medium underline underline-offset-2"
                href={'https://maps.app.goo.gl/jtm8g1GSRova8rKQA'}
              >
                for hangout
              </a>
              . So unlike other websites that just copy-paste reviews from
              Google Maps or taking it illegally from someone else&apos;s
              pay-to-view database 👀, I actually visited the cafes and wrote
              the reviews based on my experience.
            </p>
            <figure className="flex flex-col items-center gap-2">
              <Image
                src="https://image.bdgcafe.com/collage.jpeg"
                alt="Collage of my experiences in cafes"
                layout="constrained"
                width={240}
                aspectRatio={665 / 1182}
                className="w-60 h-auto rounded-lg border border-grove-light shadow-md mt-2"
              />
              <figcaption className="text-sm text-center text-bark w-96">
                A collage of my experiences in cafés around Bandung. From quiet
                corners to lively spots, each photo captures a moment that
                inspired the reviews and ratings on BDGCafé.
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Say hello</h2>
          <p className="text-bark">
            BDGCafé is an independent project, made with care in Bandung. Found
            a café that deserves a spot, or noticed something wrong? I&apos;d
            love to hear from you at{' '}
            <a
              href="mailto:contact@bdgcafe.com"
              className="font-medium underline underline-offset-2"
            >
              contact@bdgcafe.com
            </a>
            &nbsp;or leave me a message on&nbsp;
            <a
              className="font-medium underline underline-offset-2"
              href={'https://mraditya.my.id#contact'}
            >
              my personal website
            </a>
          </p>
        </div>
      </section>
    </main>
  )
}
