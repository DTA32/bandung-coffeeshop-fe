const LAST_UPDATED = '18 October 2026'
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
          2. Information you give us when you log in
        </h2>
        <p className="text-bark">
          Logging in is optional; you only need an account to write reviews.
          When you log in with Google, we receive and store your Google account
          ID, name, email address and profile picture URL. We never receive your
          Google password, and we don&apos;t access your contacts, email, files
          or anything else in your Google account.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">3. Reviews you write</h2>
        <p className="text-bark">
          When you write a review, we store your scores, the name you choose to
          show, your description, the month you visited and any specific
          ratings, linked to your account. Every review is checked before
          it&apos;s published. This is not for filtering bad or negative reviews
          (you may submit these reviews, we won&apos;t hide them, promise), but
          to prevent any harmful or illegal content from showing on this
          website. Once approved, the review is public on BDGCafé and counts
          toward the café&apos;s scores; your email address and account details
          are never shown. You can change the name on each review if you&apos;d
          rather stay anonymous, and you can edit or remove your review at any
          time.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">
          4. Location data (only with your permission)
        </h2>
        <p className="text-bark">
          Features like &quot;find nearby cafés&quot; can use your device
          location. Your browser always asks first, and you can decline. When
          you allow it, your coordinates are used only to find nearby cafés, not
          to identify you.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">5. Cookies</h2>
        <p className="text-bark">
          Google Analytics sets cookies to measure usage. Our own analytics
          doesn&apos;t use cookies. We don&apos;t use cookies for advertising or
          cross-site tracking. You can control or clear cookies in your browser
          (see &quot;Your choices&quot; below).
        </p>
        <p className="text-bark">
          When you log in, we set a session cookie to keep you logged in.
          It&apos;s essential for logging in, holds only a random identifier,
          and is removed when you log out or when it expires.
        </p>
        <p className="text-bark">
          We also keep your light/dark theme choice in your browser&apos;s local
          storage. It never leaves your device, isn&apos;t sent to us, and is
          removed when you switch back to your device theme or clear your
          browser&apos;s site data.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">6. How we use this information</h2>
        <p className="text-bark">
          Everything we collect goes toward making BDGCafé better for you:
          seeing which cafés and features people actually find useful, keeping
          pages fast and smooth, fixing bugs quickly, and shaping improvements
          around how the site is really used, so finding your next café gets a
          little easier each visit. We also use it to keep the site safe and
          secure. We don&apos;t sell your data, show ads, or build advertising
          profiles. Account information is used only to log you in, link your
          reviews to you, and keep the site free from abuse. We never display
          your email address.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">7. Third-party services</h2>
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
          <li>
            <span className="font-medium text-forest">CARTO</span> (CartoDB
            Inc.) — map tiles for interactive maps in dark mode.{' '}
            <a className={LINK} href="https://carto.com/privacy">
              CARTO Privacy Notice
            </a>
          </li>
          <li>
            <span className="font-medium text-forest">Google Sign-In</span>{' '}
            (Google LLC) — logging in to your BDGCafé account.{' '}
            <a className={LINK} href="https://policies.google.com/privacy">
              Google Privacy Policy
            </a>
          </li>
          <li>Images are served from our own CDN (image.bdgcafe.com).</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">8. Data retention</h2>
        <p className="text-bark">
          We keep analytics and log data only as long as needed for the purposes
          above; Google retains analytics data according to our configured
          settings and its own policies.
        </p>
        <p className="text-bark">
          We keep your account and reviews while your account is active. When
          you remove a review, it disappears from the site straight away, but
          there might be some footprints left; email us if you want it erased
          completely.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">9. Your choices</h2>
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
            Edit or remove your reviews anytime from the café&apos;s page.
          </li>
          <li>
            Revoke BDGCafé&apos;s access in your{' '}
            <a className={LINK} href="https://myaccount.google.com/permissions">
              Google Account settings
            </a>
            .
          </li>
          <li>
            Email{' '}
            <a className={LINK} href="mailto:contact@bdgcafe.com">
              contact@bdgcafe.com
            </a>{' '}
            to delete your account and the data linked to it.
          </li>
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
        <h2 className="font-semibold">10. Children&apos;s privacy</h2>
        <p className="text-bark">
          BDGCafé isn&apos;t directed to children, and we don&apos;t knowingly
          collect their data.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">11. Changes</h2>
        <p className="text-bark">
          We may update this policy from time to time; the &quot;last
          updated&quot; date above reflects the current version.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">12. Contact</h2>
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
