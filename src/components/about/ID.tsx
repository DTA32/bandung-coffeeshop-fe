import Image from '@/components/Image'

export default function AboutID() {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl p-6 sm:p-8 text-forest flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="font-semibold">Tentang BDGCafé ☕️</h1>
        <p className="text-lg text-bark">
          BDGCafé adalah panduan untuk kafe terbaik di Bandung yang dibuat
          oleh&nbsp;
          <a className="font-medium" href={'https://mraditya.my.id'}>
            DTA32
          </a>
          , dikurasi secara pribadi untuk bekerja, bersantai dengan teman, atau
          sekadar mencari secangkir kopi yang enak dan sudut yang tenang untuk
          menjadi milikmu sendiri.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Kenapa BDGCafé ada</h2>
        <div className="flex flex-col text-bark gap-2">
          <p>
            Ide website ini muncul dari kebutuhan pribadiku buat nyari kafe yang
            sesuai dengan suasana hari ini di Bandung. Kadang aku butuh kafe
            yang tenang dengan wifi cepat untuk bekerja. Di hari lain, aku
            pengen tempat yang ramai dengan makanan enak untuk bersantai dengan
            teman. Dan kadang-kadang aku hanya pengen kopi yang enak dan suasana
            yang nyaman untuk bersantai.
          </p>
          <p>
            Dulu, nyari kafe yang tepat berarti aku harus scrolling di daftar
            Google Maps-ku dan membaca ulang ulasan yang sudah aku tulis, lalu
            scrolling lagi setiap kali aku butuh kafe di area tertentu.
          </p>
          <p>
            Lebih parah lagi kalo butuh ketemu sama temen. Buat cari tempat yang
            adil buat semua orang, aku harus nyari titik tengah di website lama
            yang cuma nunjukin titiknya aja (gak ada rekomendasi kafe), terus
            nyari kafe di sekitarnya dan mulai baca ulang ulasan dari awal.
          </p>
          <p>
            Semua ini makan waktu dan gak efisien. Jadi aku bikin BDGCafé supaya
            nyari kafe yang tepat di Bandung lebih gampang buat aku, dan buat
            siapa aja yang butuh hal yang sama.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold">
          &quot;Jadi, gimana website ini bisa bantu aku nyari kafe?&quot;
        </h2>
        <ul className="space-y-4">
          <li>
            <h3 className="font-semibold text-forest">
              Eksplor berdasarkan distrik, area, atau lokasi saat ini
            </h3>
            <p className="text-bark">
              Lagi ada di area tertentu atau deket landmark, dan pengen nyari
              kafe terdekat? Filter kafe berdasarkan lokasi dan temukan tempat
              yang pas tanpa ribet.
            </p>
          </li>
          <li>
            <h3 className="font-semibold text-forest">Skor Work-from-café</h3>
            <p className="text-bark">
              Butuh nyelesaiin kerjaan tapi gak yakin kalo kafenya pas? Cek skor
              work-from-café untuk kecepatan wifi, colokan listrik, dan ruang
              untuk fokus sebelum kamu berangkat.
            </p>
          </li>
          <li>
            <h3 className="font-semibold text-forest">Meet in the Middle</h3>
            <p className="text-bark">
              Ngerencanain nongkrong sama temen yang tinggal di ujung-ujung
              kota? Drop pin buat masing-masing dan temukan kafe yang enak di
              titik tengah, jadi gak ada lagi alasan "kejauhan buat aku".
            </p>
          </li>
          <li>
            <h3 className="font-semibold text-forest">
              Liat harganya sebelum pergi
            </h3>
            <p className="text-bark">
              Lagi ngatur budget? Di setiap kafe ada kisaran harga untuk kopi,
              camilan, dan makanan, jadi gak kaget pas bayar.
            </p>
          </li>
          <li>
            <h3 className="font-semibold text-forest">
              Jam buka, tags, dan fakta cepat
            </h3>
            <p className="text-bark">
              Gak yakin kalo kafenya buka atau worth it buat dikunjungi? Cek jam
              buka, tags, dan fakta cepat di halaman masing-masing kafe sebelum
              kamu berangkat.
            </p>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Review jujur yang subjektif</h2>
        <div className="flex flex-col text-bark gap-1">
          <p>
            Setiap kafe di-review dan dinilai berdasarkan hal-hal yang
            benar-benar penting: harga, vibe, kebisingan, kecepatan wifi,
            makanan, suasana, dan parkir. Skor mencerminkan satu kunjungan
            (meskipun di beberapa kafe itu berdasarkan beberapa kunjungan) dan
            selera pribadi, jadi anggaplah sebagai rekomendasi dari teman, bukan
            keputusan akhir. Pengalamanmu mungkin berbeda, dan itu wajar.
          </p>
          <p>
            Kalo kamu gak percaya kalo semua ini dari pengalaman pribadiku, kamu
            bisa liat daftar Google Maps-ku yang mencantumkan kafe&nbsp;
            <a
              className="font-medium underline underline-offset-2"
              href={'https://maps.app.goo.gl/3Qbn97jVgUFfaniH8'}
            >
              buat WFC
            </a>
            &nbsp;dan&nbsp;
            <a
              className="font-medium underline underline-offset-2"
              href={'https://maps.app.goo.gl/jtm8g1GSRova8rKQA'}
            >
              buat nongkrong
            </a>
            . Jadi gak kayak website lainnya yang cuma copy-paste review dari
            Google Maps atau ngambil secara ilegal dari database orang yang
            berbayar 👀, aku beneran dateng ke kafe-kafenya dan nulis review
            berdasarkan pengalaman pribadiku
          </p>
          <figure className="flex flex-col items-center gap-2">
            <Image
              src="https://image.bdgcafe.com/collage.jpeg"
              alt="Kolase pengalaman pribadiku di kafe-kafe di Bandung"
              layout="constrained"
              width={240}
              aspectRatio={665 / 1182}
              className="w-60 h-auto rounded-lg border border-grove-light shadow-md mt-2"
            />
            <figcaption className="text-sm text-center text-bark w-96">
              Kolase foto dari pengalaman pribadiku di kafe-kafe di Bandung.
              Dari sudut yang tenang hingga tempat yang ramai, setiap foto
              menangkap momen yang menginspirasi review dan rating di BDGCafé.
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Terakhir, aku pengen denger dari kamu</h2>
        <p className="text-bark">
          BDGCafé adalah proyek independen, dibuat dengan penuh perhatian di
          Bandung. Nemuin kafe yang layak dapet tempat di sini, atau nemu
          sesuatu yang salah? Aku ingin mendengar dari kamu di{' '}
          <a
            href="mailto:contact@bdgcafe.com"
            className="font-medium underline underline-offset-2"
          >
            contact@bdgcafe.com
          </a>
          &nbsp;atau tinggalin pesan di&nbsp;
          <a
            className="font-medium underline underline-offset-2"
            href={'https://mraditya.my.id#contact'}
          >
            personal website-ku
          </a>
        </p>
      </div>
    </section>
  )
}
