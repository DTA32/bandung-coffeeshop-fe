const LAST_UPDATED = '28 Juni 2026'
const LINK = 'font-medium underline underline-offset-2'

export default function PrivacyPolicyID() {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl p-6 sm:p-8 text-forest flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold">Kebijakan Privasi</h1>
        <p className="text-sm text-bark">Terakhir diperbarui: {LAST_UPDATED}</p>
        <p className="text-lg text-bark">
          BDGCafé adalah panduan independen untuk kafe di Bandung, dikelola
          sebagai proyek pribadi. Halaman ini menjelaskan informasi apa yang
          dikumpulkan situs ini, alasannya, dan pilihan yang kamu miliki.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">
          1. Informasi yang kami kumpulkan secara otomatis
        </h2>
        <ul className="flex flex-col gap-3 text-bark">
          <li>
            <span className="font-semibold text-forest">
              Analitik penggunaan dan performa.
            </span>{' '}
            Kami menggunakan Google Analytics 4 dan analitik first-party kami
            sendiri untuk memahami bagaimana situs digunakan dan menjaganya
            tetap cepat: halaman yang dilihat dan navigasi di dalam situs;
            interaksi tertentu dengan fitur (misalnya, penggunaan Meet in the
            Middle, atau tindakan lain yang kami catat sebagai event analitik);
            metrik kecepatan muat dan responsivitas halaman (&quot;Web
            Vitals&quot;); informasi umum perangkat dan browser (jenis, ukuran
            layar, bahasa); dan perkiraan lokasi setingkat kota yang diperoleh
            dari alamat IP-mu.
          </li>
          <li>
            <span className="font-semibold text-forest">Diagnostik error.</span>{' '}
            Saat terjadi masalah, kami mencatat detail teknis untuk
            memperbaikinya (pesan error dan stack trace), halaman tempat
            terjadinya, dan user-agent browser-mu. Ini tidak dimaksudkan untuk
            memuat data pribadi, meskipun alamat halaman terkadang bisa muncul.
          </li>
          <li>
            <span className="font-semibold text-forest">Log server.</span>{' '}
            Server kami mencatat data permintaan teknis seperti alamat IP, URL
            yang diminta, waktu, status respons, dan jenis browser untuk
            mengoperasikan situs dan melindunginya dari penyalahgunaan dan
            serangan.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">2. Data lokasi (hanya dengan izinmu)</h2>
        <p className="text-bark">
          Fitur seperti &quot;cari kafe terdekat&quot; dapat menggunakan lokasi
          perangkatmu. Browser-mu akan selalu meminta izin terlebih dahulu, dan
          kamu bisa menolak. Saat kamu mengizinkannya, koordinatmu hanya
          digunakan untuk mencari kafe terdekat, bukan untuk mengidentifikasimu.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">3. Cookie</h2>
        <p className="text-bark">
          Google Analytics menyetel cookie untuk mengukur penggunaan. Analitik
          kami sendiri tidak menggunakan cookie. Kami tidak menggunakan cookie
          untuk iklan atau pelacakan lintas situs. Kamu bisa mengatur atau
          menghapus cookie di browser-mu (lihat &quot;Pilihanmu&quot; di bawah).
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">
          4. Bagaimana kami menggunakan informasi ini
        </h2>
        <p className="text-bark">
          Semua yang kami kumpulkan ditujukan untuk membuat BDGCafé lebih baik
          untukmu: melihat kafe dan fitur mana yang benar-benar berguna bagi
          pengunjung, menjaga halaman tetap cepat dan mulus, memperbaiki bug
          dengan cepat, dan merencanakan pengembangan lebih lanjut berdasarkan
          bagaimana situs benar-benar digunakan, sehingga menemukan kafe
          berikutnya menjadi sedikit lebih mudah setiap kali berkunjung. Kami
          juga menggunakannya untuk menjaga situs tetap aman. Kami tidak menjual
          datamu, menampilkan iklan, atau membuat profil iklan.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">5. Layanan pihak ketiga</h2>
        <p className="text-bark">
          Kami mengandalkan beberapa penyedia tepercaya yang mungkin memproses
          data sebagai bagian dari penyajian situs. Masing-masing menangani data
          berdasarkan kebijakannya sendiri.
        </p>
        <ul className="flex flex-col gap-2 text-bark list-disc pl-5">
          <li>
            <span className="font-medium text-forest">Google Analytics</span>{' '}
            (Google LLC) — analitik penggunaan.{' '}
            <a className={LINK} href="https://policies.google.com/privacy">
              Kebijakan Privasi Google
            </a>
          </li>
          <li>
            <span className="font-medium text-forest">OpenStreetMap</span> —
            gambar peta untuk peta interaktif.{' '}
            <a
              className={LINK}
              href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
            >
              Kebijakan Privasi OSMF
            </a>
          </li>
          <li>Gambar disajikan dari CDN kami sendiri (image.bdgcafe.com).</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">6. Penyimpanan data</h2>
        <p className="text-bark">
          Kami menyimpan data analitik dan log hanya selama diperlukan untuk
          tujuan di atas; Google menyimpan data analitik sesuai pengaturan yang
          kami konfigurasikan dan kebijakannya sendiri.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">7. Pilihanmu</h2>
        <ul className="flex flex-col gap-2 text-bark list-disc pl-5">
          <li>Menolak atau menghapus cookie di browser-mu.</li>
          <li>
            Menonaktifkan Google Analytics dengan{' '}
            <a className={LINK} href="https://tools.google.com/dlpage/gaoptout">
              add-on browser opt-out
            </a>{' '}
            dari Google.
          </li>
          <li>Menolak atau mencabut akses lokasi kapan saja di browser-mu.</li>
          <li>
            Email{' '}
            <a className={LINK} href="mailto:contact@bdgcafe.com">
              contact@bdgcafe.com
            </a>{' '}
            untuk menanyakan data yang kami simpan atau meminta penghapusannya.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">8. Privasi anak</h2>
        <p className="text-bark">
          BDGCafé tidak ditujukan untuk anak-anak, dan kami tidak dengan sengaja
          mengumpulkan data mereka.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">9. Perubahan</h2>
        <p className="text-bark">
          Kami dapat memperbarui kebijakan ini dari waktu ke waktu; tanggal
          &quot;terakhir diperbarui&quot; di atas mencerminkan versi saat ini.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">10. Kontak</h2>
        <p className="text-bark">
          Ada pertanyaan? Email{' '}
          <a className={LINK} href="mailto:contact@bdgcafe.com">
            contact@bdgcafe.com
          </a>
          .
        </p>
      </div>
    </section>
  )
}
