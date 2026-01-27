import { ArrowLeft } from 'lucide-react';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export default function TermsAndConditions({ onBack }: TermsAndConditionsProps) {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Általános Szerződési Feltételek</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Hatályos: {new Date().toLocaleDateString('hu-HU')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Általános rendelkezések</h2>
            <p>
              Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) tartalmazzák a
              [Weboldal neve] webáruházban (a továbbiakban: Szolgáltató) keresztül történő
              vásárlás feltételeit.
            </p>
            <p className="mt-2">
              A megrendelés elküldésével a Vásárló elfogadja a jelen ÁSZF-ben foglaltakat, és
              kötelezettséget vállal a rendelkezések betartására.
            </p>

            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Szolgáltató adatai:</h3>
              <p>
                <strong>Név:</strong> Péntek Dávid EV<br />
                <strong>Székhely:</strong> 8446 Kislőd, Bocskay utca 14.<br />
                <strong>Adószám:</strong> 46362078<br />
                <strong>Email:</strong> vintagevibeshungary@gmail.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. A szerződés tárgya és hatálya</h2>
            <p>
              A szerződés tárgya vintage és használt ruházati termékek adásvétele. A szerződés a
              megrendelés Szolgáltató által történő visszaigazolásával jön létre.
            </p>
            <p className="mt-2">
              Mivel a termékek egyedi, használt darabok, minden termék csak egy példányban áll
              rendelkezésre. A rendelés leadása nem jelenti automatikusan a termék lefoglalását.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Megrendelés menete</h2>

            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Termék kiválasztása:</strong> A Vásárló kiválasztja a kívánt termékeket és
                azokat a kosárba helyezi.
              </li>
              <li>
                <strong>Megrendelési adatok megadása:</strong> Név, email cím, telefonszám,
                szállítási és számlázási cím megadása.
              </li>
              <li>
                <strong>Megrendelés elküldése:</strong> A Vásárló az ÁSZF elfogadásával küldi el
                a megrendelést.
              </li>
              <li>
                <strong>Visszaigazolás:</strong> A Szolgáltató emailben visszaigazolja a
                megrendelést és ellenőrzi a termékek készletét.
              </li>
              <li>
                <strong>Fizetés:</strong> A Vásárló teljesíti a fizetést a választott módon.
              </li>
              <li>
                <strong>Kiszállítás:</strong> A termék kiszállítása a fizetés beérkezését követően.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Árak és fizetési módok</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1. Árak</h3>
                <p>
                  A weboldalon feltüntetett árak forintban (Ft) értendők, tartalmazzák az ÁFÁ-t.
                  A szállítási költség a termék árán felül értendő, mértékét a megrendelés során
                  jelezzük.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2. Fizetési módok</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Bankkártyás fizetés:</strong> Online bankkártyás fizetés Barion rendszerén keresztül</li>
                  <li><strong>Átutalás:</strong> Banki átutalással történő fizetés</li>
                  <li><strong>Utánvét:</strong> Fizetés a futárnak készpénzben az átvételkor</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Szállítás</h2>
            <p>
              A szállítás házhozszállítással történik futárszolgálat útján, Magyarország területére.
            </p>

            <div className="mt-4 space-y-2">
              <p><strong>Szállítási idő:</strong> 2-5 munkanap a fizetés beérkezését követően</p>
              <p><strong>Szállítási költség:</strong> A kosár értékétől függően változik (lásd részletesen a Szállítási Feltételekben)</p>
            </div>

            <p className="mt-4">
              A Szolgáltató nem vállal felelősséget a futárszolgálat hibájából eredő késedelemért.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Elállási jog (14 napos visszaküldési jog)</h2>

            <p>
              A fogyasztó a termék kézhezvételétől számított 14 napon belül indokolás nélkül
              elállhat a szerződéstől.
            </p>

            <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4">
              <p className="font-semibold text-amber-900 mb-2">Fontos tudnivalók:</p>
              <ul className="list-disc pl-6 space-y-1 text-amber-900">
                <li>Az elállási szándékot emailben vagy telefonon kell bejelenteni</li>
                <li>A terméket eredeti állapotában, bontatlan csomagolásban kell visszaküldeni</li>
                <li>A visszaküldés költsége a Vásárlót terheli</li>
                <li>A vételár visszatérítése a termék visszaérkezését követő 14 napon belül</li>
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Elállási jog nem illeti meg a Vásárlót:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Olyan használt termék esetén, amely nem megfelelő állapotban került visszaküldésre</li>
                <li>Ha a termék sérült vagy használat nyomait viseli</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Felelősség és jótállás</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">7.1. Termékek állapota</h3>
                <p>
                  A vintage és használt termékek esetében a Szolgáltató minden terméknél feltünteti
                  az állapotot és a látható hibákat. A termékleírásban jelzett használati nyomok,
                  apró hibák nem képezik reklamáció alapját.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">7.2. Reklamáció</h3>
                <p>
                  Rejtett hiba esetén a Vásárló a termék átvételétől számított 3 napon belül
                  reklamálhat emailben vagy telefonon.
                </p>
                <p className="mt-2">
                  Reklamáció esetén kérjük, hogy készítsen fényképeket a hibáról és küldje el
                  emailben a vintagevibeshungary@gmail.com címre.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Szerzői jogok</h2>
            <p>
              A weboldalon található tartalom (szöveg, kép, grafika, logó) a Szolgáltató kizárólagos
              tulajdona. A tartalom másolása, terjesztése, kereskedelmi célú felhasználása tilos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Vis maior</h2>
            <p>
              A Szolgáltató nem vállal felelősséget olyan késedelemért vagy teljesítési
              problémáért, amely vis maior (elháríthatatlan külső ok, pl. természeti katasztrófa,
              háború, járvány) következménye.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Adatkezelés</h2>
            <p>
              A személyes adatok kezelésére vonatkozó részletes tájékoztatást az
              {' '}
              <a href="/privacy-policy" className="text-amber-600 hover:text-amber-700 underline font-semibold">
                Adatvédelmi Tájékoztatóban
              </a>
              {' '}
              találja.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Vitarendezés</h2>
            <p>
              A Szolgáltató és a Vásárló között felmerülő vitás kérdéseket elsősorban békés
              úton, egyeztetés útján kívánjuk rendezni.
            </p>
            <p className="mt-2">
              Fogyasztói jogvita esetén a fogyasztó a lakóhelye szerint illetékes
              békéltető testülethez fordulhat.
            </p>
            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <p className="font-semibold mb-2">Online Vitarendezési Platform:</p>
              <p>
                Az Európai Bizottság online vitarendezési platformja elérhető a következő címen:
                <br />
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 underline"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Vegyes rendelkezések</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Az ÁSZF módosításának jogát a Szolgáltató fenntartja</li>
              <li>A módosított ÁSZF a weboldalon történő közzététel napján lép hatályba</li>
              <li>A már leadott rendelésekre a megrendelés időpontjában hatályos ÁSZF vonatkozik</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Kapcsolat</h2>
            <p>
              Kérdés esetén vegye fel velünk a kapcsolatot:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> vintagevibeshungary@gmail.com<br />
              <strong>Cím:</strong> 8446 Kislőd, Bocskay utca 14.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
