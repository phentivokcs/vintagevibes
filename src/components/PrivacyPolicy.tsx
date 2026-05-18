import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={onBack}
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
          <h1 className="text-2xl font-bold text-gray-900">Adatvédelmi Tájékoztató</h1>
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Bevezetés</h2>
            <p>
              Jelen adatvédelmi tájékoztató célja, hogy bemutassa, hogyan kezeljük a személyes adatokat
              weboldalunkon keresztül. Kötelezettséget vállalunk arra, hogy védelmezzük az Ön személyes
              adatait és tiszteletben tartjuk az Ön magánélethez való jogát.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Adatkezelő adatai</h2>
            <p>
              <strong>Név:</strong> Péntek Dávid EV<br />
              <strong>Székhely:</strong> 8446 Kislőd, Bocskay utca 14.<br />
              <strong>Adószám:</strong> 46362078<br />
              <strong>Email:</strong> vintagevibeshungary@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Kezelt személyes adatok köre</h2>
            <p>Az alábbi személyes adatokat kezeljük:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Regisztráció és vásárlás során:</strong> név, email cím, telefonszám, szállítási cím, számlázási cím</li>
              <li><strong>Technikai adatok:</strong> IP cím, böngésző típusa, eszköz adatai, cookie-k</li>
              <li><strong>Rendelési adatok:</strong> vásárolt termékek, rendelés összege, fizetési mód</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Adatkezelés célja és jogalapja</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1. Szerződés teljesítése</h3>
                <p>
                  A rendelések feldolgozása, teljesítése és a vásárlókkal való kapcsolattartás.
                  <br />
                  <strong>Jogalap:</strong> GDPR 6. cikk (1) bekezdés b) pont - szerződés teljesítése
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2. Jogi kötelezettség teljesítése</h3>
                <p>
                  Számviteli, adózási kötelezettségek teljesítése.
                  <br />
                  <strong>Jogalap:</strong> GDPR 6. cikk (1) bekezdés c) pont - jogi kötelezettség
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4.3. Hozzájáruláson alapuló adatkezelés</h3>
                <p>
                  Hírlevel küldése, marketing kommunikáció (csak hozzájárulás esetén).
                  <br />
                  <strong>Jogalap:</strong> GDPR 6. cikk (1) bekezdés a) pont - hozzájárulás
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Adattárolás időtartama</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Regisztrációs adatok:</strong> a regisztráció törléséig</li>
              <li><strong>Rendelési adatok:</strong> számviteli jogszabályok szerint 8 év</li>
              <li><strong>Marketing hozzájárulás:</strong> a hozzájárulás visszavonásáig</li>
              <li><strong>Cookie-k:</strong> 1 év, vagy a hozzájárulás visszavonásáig</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Cookie-k (Sütik) használata</h2>
            <p>
              Weboldalunk sütiket használ a felhasználói élmény javítása érdekében. A sütik kis
              szöveges fájlok, amelyeket a böngésző tárol az Ön eszközén.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Feltétlenül szükséges sütik:</h3>
                <p>A weboldal működéséhez elengedhetetlenek (pl. bejelentkezés, kosár kezelése)</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Analitikai sütik:</h3>
                <p>Segítenek megérteni, hogyan használják a látogatók a weboldalt</p>
              </div>
            </div>

            <p className="mt-4">
              A sütiket bármikor törölheti a böngésző beállításaiban, vagy visszavonhatja hozzájárulását.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6.1. Barion Pixel</h2>
            <p>
              Weboldalunkon a Barion Payment Zrt. által nyújtott Barion Pixel szolgáltatást használjuk
              csalásmegelőzési célból. A Barion Pixel egy javascript kód, amely információkat gyűjt az
              Ön böngészési szokásairól annak érdekében, hogy megvédje Önt és minket a visszaélésektől.
            </p>

            <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4">
              <p className="font-semibold text-amber-900 mb-2">Barion Pixel által gyűjtött adatok:</p>
              <ul className="list-disc pl-6 space-y-1 text-amber-900">
                <li>Az Ön IP címe</li>
                <li>A látogatás pontos ideje</li>
                <li>A böngésző böngészőazonosítója (user agent)</li>
                <li>A meglátogatott oldal címe (URL)</li>
                <li>A pixelt betöltő oldal címe (referrer)</li>
              </ul>
            </div>

            <p className="mt-4">
              <strong>Az adatkezelés célja:</strong> Csalásmegelőzés, biztonságos fizetési folyamat biztosítása
            </p>
            <p className="mt-2">
              <strong>Az adatkezelés jogalapja:</strong> GDPR 6. cikk (1) bekezdés f) pont - jogos érdek (a biztonságos
              fizetési szolgáltatás nyújtása és a visszaélések megelőzése)
            </p>
            <p className="mt-2">
              <strong>Az adatkezelő:</strong> Barion Payment Zrt. (1117 Budapest, Infopark sétány 1. I. épület, 5. emelet)
            </p>
            <p className="mt-2">
              <strong>További információ:</strong> A Barion Pixel adatkezeléséről bővebb információt a{' '}
              <a
                href="https://www.barion.com/hu/pixel-tajekoztato/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 underline"
              >
                Barion Pixel Tájékoztatóban
              </a>
              {' '}talál.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Az Ön jogai</h2>
            <p>Önnek joga van:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Hozzáférési jog:</strong> tájékoztatást kérni az adatkezelésről</li>
              <li><strong>Helyesbítéshez való jog:</strong> pontatlan adatok javítását kérni</li>
              <li><strong>Törléshez való jog:</strong> adatai törlését kérni ("elfeledtetéshez való jog")</li>
              <li><strong>Korlátozáshoz való jog:</strong> az adatkezelés korlátozását kérni</li>
              <li><strong>Adathordozhatósághoz való jog:</strong> adatait strukturált formátumban megkapni</li>
              <li><strong>Tiltakozáshoz való jog:</strong> tiltakozni az adatkezelés ellen</li>
              <li><strong>Hozzájárulás visszavonása:</strong> bármikor visszavonhatja hozzájárulását</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Adatbiztonság</h2>
            <p>
              Megteszünk minden ésszerű technikai és szervezési intézkedést annak érdekében, hogy
              megvédjük személyes adatait a jogosulatlan hozzáféréstől, megváltoztatástól,
              nyilvánosságra hozataltól vagy megsemmisítéstől. Biztonságos SSL titkosítást használunk,
              és az adatokat biztonságos szervereken tároljuk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Adattovábbítás harmadik félnek</h2>
            <p>
              Személyes adatait csak akkor adjuk át harmadik félnek, ha az a szerződés teljesítéséhez
              szükséges (pl. futárszolgálat a kiszállításhoz, fizetési szolgáltató), vagy ha arra
              jogszabály kötelez bennünket.
            </p>
            <p className="mt-2">
              Adatfeldolgozóink: futárszolgálatok, fizetési szolgáltatók, hosting szolgáltató.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Kapcsolatfelvétel</h2>
            <p>
              Amennyiben kérdése van adatvédelmi gyakorlatunkkal kapcsolatban, vagy gyakorolni
              szeretné jogait, kérjük, vegye fel velünk a kapcsolatot:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> vintagevibeshungary@gmail.com<br />
              <strong>Postai cím:</strong> 8446 Kislőd, Bocskay utca 14.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Panasztétel joga</h2>
            <p>
              Amennyiben úgy érzi, hogy megsértettük adatvédelmi jogait, panaszt tehet a
              Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH):
            </p>
            <p className="mt-2">
              <strong>Cím:</strong> 1055 Budapest, Falk Miksa utca 9-11.<br />
              <strong>Telefon:</strong> +36 (1) 391-1400<br />
              <strong>Email:</strong> ugyfelszolgalat@naih.hu<br />
              <strong>Weboldal:</strong> www.naih.hu
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Módosítások</h2>
            <p>
              Fenntartjuk a jogot, hogy jelen adatvédelmi tájékoztatót bármikor módosítsuk.
              A módosításokról weboldalunkon keresztül tájékoztatjuk Önt. Javasoljuk, hogy
              rendszeresen tekintse át ezt az oldalt.
            </p>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
