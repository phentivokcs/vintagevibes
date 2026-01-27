import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Vissza
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Adatvédelmi Tájékoztató</h1>

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
  );
}
