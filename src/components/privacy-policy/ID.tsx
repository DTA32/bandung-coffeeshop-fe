const LAST_UPDATED = '18 Oktober 2026'
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
        <h2 className="font-semibold">
          2. Informasi yang kamu berikan saat masuk
        </h2>
        <p className="text-bark">
          Login bersifat opsional; kamu hanya perlu akun untuk menulis ulasan.
          Saat kamu masuk dengan Google, kami menerima dan menyimpan ID akun
          Google, nama, alamat email, dan URL foto profilmu. Kami tidak pernah
          menerima kata sandi Google-mu, dan kami tidak mengakses kontak, email,
          file, atau hal lain di akun Google-mu.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">3. Ulasan yang kamu tulis</h2>
        <p className="text-bark">
          Saat kamu menulis ulasan, kami menyimpan skor, nama yang kamu pilih
          untuk ditampilkan, deskripsi, bulan kunjungan, dan penilaian spesifik
          yang kamu berikan, yang terhubung ke akunmu. Setiap ulasan kami
          periksa sebelum ditayangkan. Ini bukan untuk menyeleksi review jelek
          atau negatif (kamu boleh tulis ulasan seperti ini, kami tidak akan
          menyembunyikannya, janji), tapi untuk mencegah adanya konten
          membahayakan atau ilegal yang muncul di website ini. Setelah
          disetujui, ulasan akan tampil secara publik di BDGCafé dan ikut
          dihitung dalam skor kafe; alamat email dan detail akunmu tidak pernah
          ditampilkan. Kamu bisa mengganti nama di setiap ulasan jika ingin
          tetap anonim, dan kamu bisa mengubah atau menghapus ulasanmu kapan
          saja.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">4. Data lokasi (hanya dengan izinmu)</h2>
        <p className="text-bark">
          Fitur seperti &quot;cari kafe terdekat&quot; dapat menggunakan lokasi
          perangkatmu. Browser-mu akan selalu meminta izin terlebih dahulu, dan
          kamu bisa menolak. Saat kamu mengizinkannya, koordinatmu hanya
          digunakan untuk mencari kafe terdekat, bukan untuk mengidentifikasimu.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">5. Cookie</h2>
        <p className="text-bark">
          Google Analytics menyetel cookie untuk mengukur penggunaan. Analitik
          kami sendiri tidak menggunakan cookie. Kami tidak menggunakan cookie
          untuk iklan atau pelacakan lintas situs. Kamu bisa mengatur atau
          menghapus cookie di browser-mu (lihat &quot;Pilihanmu&quot; di bawah).
        </p>
        <p className="text-bark">
          Saat kamu masuk, kami menyetel cookie sesi agar kamu tetap dalam
          keadaan masuk. Cookie ini wajib untuk fitur masuk, hanya berisi
          pengenal acak, dan terhapus saat kamu keluar (logout) atau saat masa
          berlakunya habis.
        </p>
        <p className="text-bark">
          Kami juga menyimpan pilihan tema terang/gelap-mu di penyimpanan lokal
          (local storage) browser-mu. Data ini tidak pernah keluar dari
          perangkatmu, tidak dikirim ke kami, dan terhapus saat kamu kembali ke
          tema perangkat atau menghapus data situs di browser-mu.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">
          6. Bagaimana kami menggunakan informasi ini
        </h2>
        <p className="text-bark">
          Semua yang kami kumpulkan ditujukan untuk membuat BDGCafé lebih baik
          untukmu: melihat kafe dan fitur mana yang benar-benar berguna bagi
          pengunjung, menjaga halaman tetap cepat dan mulus, memperbaiki bug
          dengan cepat, dan merencanakan pengembangan lebih lanjut berdasarkan
          bagaimana situs benar-benar digunakan, sehingga menemukan kafe
          berikutnya menjadi sedikit lebih mudah setiap kali berkunjung. Kami
          juga menggunakannya untuk menjaga situs tetap aman. Kami tidak menjual
          datamu, menampilkan iklan, atau membuat profil iklan. Informasi akun
          hanya digunakan untuk memasukkanmu ke akun, menghubungkan ulasan
          dengan akunmu, dan menjaga situs dari penyalahgunaan. Kami tidak
          pernah menampilkan alamat emailmu.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">7. Layanan pihak ketiga</h2>
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
          <li>
            <span className="font-medium text-forest">CARTO</span> (CartoDB
            Inc.) — gambar peta untuk peta interaktif dalam mode gelap.{' '}
            <a className={LINK} href="https://carto.com/privacy">
              Pemberitahuan Privasi CARTO
            </a>
          </li>
          <li>
            <span className="font-medium text-forest">Google Sign-In</span>{' '}
            (Google LLC) — masuk ke akun BDGCafé-mu.{' '}
            <a className={LINK} href="https://policies.google.com/privacy">
              Kebijakan Privasi Google
            </a>
          </li>
          <li>Gambar disajikan dari CDN kami sendiri (image.bdgcafe.com).</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">8. Penyimpanan data</h2>
        <p className="text-bark">
          Kami menyimpan data analitik dan log hanya selama diperlukan untuk
          tujuan di atas; Google menyimpan data analitik sesuai pengaturan yang
          kami konfigurasikan dan kebijakannya sendiri.
        </p>
        <p className="text-bark">
          Kami menyimpan akun dan ulasanmu selama akunmu aktif. Saat kamu
          menghapus ulasan, ulasan langsung hilang dari situs, tetapi mungkin
          akan ada sisa-sisa data tersisa; email kami jika kamu ingin ulasan
          tersebut dihapus sepenuhnya. Jika kami menonaktifkan akun karena
          penyalahgunaan, ulasan dari akun tersebut disembunyikan dari situs.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">9. Pilihanmu</h2>
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
          <li>Ubah atau hapus ulasanmu kapan saja dari halaman kafe.</li>
          <li>
            Cabut akses BDGCafé di{' '}
            <a className={LINK} href="https://myaccount.google.com/permissions">
              pengaturan Akun Google-mu
            </a>
            .
          </li>
          <li>
            Email{' '}
            <a className={LINK} href="mailto:contact@bdgcafe.com">
              contact@bdgcafe.com
            </a>{' '}
            untuk menghapus akunmu beserta data yang terhubung dengannya.
          </li>
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
        <h2 className="font-semibold">10. Privasi anak</h2>
        <p className="text-bark">
          BDGCafé tidak ditujukan untuk anak-anak, dan kami tidak dengan sengaja
          mengumpulkan data mereka.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">11. Perubahan</h2>
        <p className="text-bark">
          Kami dapat memperbarui kebijakan ini dari waktu ke waktu; tanggal
          &quot;terakhir diperbarui&quot; di atas mencerminkan versi saat ini.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">12. Kontak</h2>
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
