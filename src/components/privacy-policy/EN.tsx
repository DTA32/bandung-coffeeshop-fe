const LAST_UPDATED = '28 June 2026'
const LINK = 'font-medium underline underline-offset-2'

export default function PrivacyPolicyEN() {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl p-6 sm:p-8 text-forest flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold">Privacy Policy</h1>
        <p className="text-sm text-bark">Last updated: {LAST_UPDATED}</p>
        <p className="text-lg text-bark">
          BDGCafé is an independent guide to cafés in Bandung, run as a personal
          project. This page explains what information the site collects, why,
          and the choices you have.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">
          1. Information we collect automatically
        </h2>
        <ul className="flex flex-col gap-3 text-bark">
          <li>
            <span className="font-semibold text-forest">
              Usage and performance analytics.
            </span>{' '}
            We use Google Analytics 4 and our own first-party analytics to
            understand how the site is used and keep it fast: pages viewed and
            in-site navigation; specific interactions with features (for
            example, using Meet in the Middle, or other actions we record as
            analytics events); page-load and responsiveness metrics (&quot;Web
            Vitals&quot;); general device and browser info (type, screen size,
            language); and an approximate, city-level location derived from your
            IP.
          </li>
          <li>
            <span className="font-semibold text-forest">
              Error diagnostics.
            </span>{' '}
            When something breaks, we record technical details to fix it (error
            message and stack trace), the page it happened on, and your
            browser&apos;s user-agent. This isn&apos;t meant to contain personal
            data, though a page address could occasionally appear.
          </li>
          <li>
            <span className="font-semibold text-forest">Server logs.</span> Our
            server records technical request data, like IP address, requested
            URL, timestamps, response status, and browser type, to operate the
            site and protect it against abuse and attacks.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">
          2. Location data (only with your permission)
        </h2>
        <p className="text-bark">
          Features like &quot;find nearby cafés&quot; can use your device
          location. Your browser always asks first, and you can decline. When
          you allow it, your coordinates are used only to find nearby cafés, not
          to identify you.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">3. Cookies</h2>
        <p className="text-bark">
          Google Analytics sets cookies to measure usage. Our own analytics
          doesn&apos;t use cookies. We don&apos;t use cookies for advertising or
          cross-site tracking. You can control or clear cookies in your browser
          (see &quot;Your choices&quot; below).
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">4. How we use this information</h2>
        <p className="text-bark">
          Everything we collect goes toward making BDGCafé better for you:
          seeing which cafés and features people actually find useful, keeping
          pages fast and smooth, fixing bugs quickly, and shaping improvements
          around how the site is really used, so finding your next café gets a
          little easier each visit. We also use it to keep the site safe and
          secure. We don&apos;t sell your data, show ads, or build advertising
          profiles.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">5. Third-party services</h2>
        <p className="text-bark">
          We rely on a few trusted providers that may process data as part of
          delivering the site. Each handles data under its own policy.
        </p>
        <ul className="flex flex-col gap-2 text-bark list-disc pl-5">
          <li>
            <span className="font-medium text-forest">Google Analytics</span>{' '}
            (Google LLC) — usage analytics.{' '}
            <a className={LINK} href="https://policies.google.com/privacy">
              Google Privacy Policy
            </a>
          </li>
          <li>
            <span className="font-medium text-forest">OpenStreetMap</span> — map
            tiles for interactive maps.{' '}
            <a
              className={LINK}
              href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
            >
              OSMF Privacy Policy
            </a>
          </li>
          <li>Images are served from our own CDN (image.bdgcafe.com).</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">6. Data retention</h2>
        <p className="text-bark">
          We keep analytics and log data only as long as needed for the purposes
          above; Google retains analytics data according to our configured
          settings and its own policies.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">7. Your choices</h2>
        <ul className="flex flex-col gap-2 text-bark list-disc pl-5">
          <li>Decline or clear cookies in your browser.</li>
          <li>
            Opt out of Google Analytics with Google&apos;s{' '}
            <a className={LINK} href="https://tools.google.com/dlpage/gaoptout">
              opt-out browser add-on
            </a>
            .
          </li>
          <li>Deny or revoke location access anytime in your browser.</li>
          <li>
            Email{' '}
            <a className={LINK} href="mailto:contact@bdgcafe.com">
              contact@bdgcafe.com
            </a>{' '}
            to ask what we hold or request deletion.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">8. Children&apos;s privacy</h2>
        <p className="text-bark">
          BDGCafé isn&apos;t directed to children, and we don&apos;t knowingly
          collect their data.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">9. Changes</h2>
        <p className="text-bark">
          We may update this policy from time to time; the &quot;last
          updated&quot; date above reflects the current version.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">10. Contact</h2>
        <p className="text-bark">
          Questions? Email{' '}
          <a className={LINK} href="mailto:contact@bdgcafe.com">
            contact@bdgcafe.com
          </a>
          .
        </p>
      </div>
    </section>
  )
}
