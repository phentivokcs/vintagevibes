import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export default function TermsAndConditions({ onBack }: TermsAndConditionsProps) {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('company_phone, company_registration_number')
        .maybeSingle();

      if (data) {
        setSettings(data);
      }
    };

    loadSettings();
  }, []);

  return (
    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={onBack}
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
          <h1 className="text-2xl font-bold text-gray-900">Általános Szerződési Feltételek</h1>
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8">
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
                {settings?.company_registration_number && (
                  <>
                    <strong>Cégjegyzékszám:</strong> {settings.company_registration_number}<br />
                  </>
                )}
                <strong>Adószám:</strong> 46362078<br />
                <strong>Email:</strong> vintagevibeshungary@gmail.com<br />
                {settings?.company_phone && (
                  <>
                    <strong>Telefon:</strong> {settings.company_phone}
                  </>
                )}
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
                  <li><strong>Bankkártyás fizetés Barion rendszeren keresztül</strong></li>
                  <li><strong>Utánvét:</strong> Fizetés a futárnak készpénzben az átvételkor</li>
                </ul>

                <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Barion bankkártyás fizetés</h4>
                  <p className="text-sm text-blue-900 mb-2">
                    A bankkártyás fizetést a <strong>Barion Payment Zrt.</strong> (1117 Budapest, Infopark sétány 1., I. épület 5. emelet) biztosítja.
                  </p>
                  <p className="text-sm text-blue-900 mb-2">
                    A Barion rendszerén keresztül a következő kártyatípusokkal fizethet: Visa, Visa Electron, Mastercard, Maestro.
                  </p>
                  <p className="text-sm text-blue-900 mb-2">
                    A fizetési folyamat során a Vásárló közvetlenül a Barion biztonságos fizetési felületére kerül, ahol megadhatja bankkártyája adatait. A kártyaadatok kizárólag a Barion rendszerében kerülnek tárolásra, a Szolgáltató nem fér hozzá és nem is tárolja ezeket az adatokat.
                  </p>
                  <p className="text-sm text-blue-900 mb-2">
                    A Barion PCI-DSS tanúsítvánnyal rendelkező, biztonságos online fizetési szolgáltató. A tranzakciók 256 bites SSL titkosítással védettek.
                  </p>
                  <p className="text-sm text-blue-900 mb-2">
                    A bankkártyás tranzakció teljesítését a Vásárló bankja véglegesíti. Sikertelen fizetés esetén a termékek visszakerülnek a készletbe, és a Vásárlónak újra kell kezdenie a rendelést.
                  </p>
                  <p className="text-sm text-blue-900">
                    A Barion szolgáltatásaival kapcsolatos további információk: <a href="https://www.barion.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">www.barion.com</a>
                  </p>
                </div>
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

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">6.1. Az elállási jog gyakorlása</h3>
                <p>
                  A fogyasztónak a termék kézhezvételétől, vagy ha több tétel külön kerül szállításra,
                  az utolsó tétel kézhezvételétől számított 14 napon belül joga van indokolás nélkül
                  elállni a szerződéstől.
                </p>
                <p className="mt-2">
                  Az elállási jog gyakorlásához a Vásárlónak egyértelmű nyilatkozatot kell tennie
                  (pl. postai úton vagy e-mailben) az elállási szándékáról a következő elérhetőségeken:
                </p>
                <div className="mt-2 bg-gray-100 p-3 rounded">
                  <p>
                    <strong>Email:</strong> vintagevibeshungary@gmail.com<br />
                    {settings?.company_phone && (
                      <>
                        <strong>Telefon:</strong> {settings.company_phone}<br />
                      </>
                    )}
                    <strong>Postai cím:</strong> 8446 Kislőd, Bocskay utca 14.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">6.2. Az elállás következményei</h3>
                <p className="mb-2">
                  Ha a Vásárló eláll a szerződéstől, a Szolgáltató haladéktalanul, de legkésőbb
                  a Vásárló elállási nyilatkozatának kézhezvételétől számított 14 napon belül
                  visszatéríti a Vásárló által kifizetett valamennyi ellenértéket, beleértve
                  a teljesítéssel összefüggésben felmerült költségeket is.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                  <p className="font-semibold text-amber-900 mb-2">Fontos tudnivalók:</p>
                  <ul className="list-disc pl-6 space-y-1 text-amber-900">
                    <li>A Szolgáltató a visszatérítést a Vásárló által használt fizetési móddal megegyező módon teljesíti</li>
                    <li>A visszatérítést mindaddig visszatarthatjuk, amíg vissza nem kaptuk a terméket</li>
                    <li>A termék visszaküldésének költsége a Vásárlót terheli</li>
                    <li>A terméket sértetlenül, eredeti csomagolásában kell visszajuttatni</li>
                    <li>A Vásárló köteles a terméket az elállási nyilatkozat közlésétől számított 14 napon belül visszaküldeni</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">6.3. A Vásárló felelőssége</h3>
                <p>
                  A Vásárló csak akkor felel a termékben bekövetkezett értékcsökkenésért, ha az
                  a termék jellegének, tulajdonságainak és működésének megállapításához szükséges
                  használatot meghaladó használat miatt következett be.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">6.4. Az elállási jog korlátozása</h3>
                <p className="mb-2">
                  A fogyasztót nem illeti meg az elállási jog a következő esetekben:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ha a termék lezárt csomagolását a Vásárló felbontotta és a termék higiéniai okokból már nem küldhető vissza</li>
                  <li>Ha a termék a kiszállítását követően a Vásárló tulajdonában elválaszthatatlanul vegyült más termékkel</li>
                  <li>Olyan használt termék esetén, amely nem megfelelő állapotban került visszaküldésre</li>
                  <li>Ha a termék sérült vagy túlzott használat nyomait viseli</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">6.5. Elállási nyilatkozat minta</h3>
                <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                  <p className="font-mono text-sm">
                    Címzett: Péntek Dávid EV<br />
                    8446 Kislőd, Bocskay utca 14.<br />
                    vintagevibeshungary@gmail.com<br /><br />
                    Alulírott kijelentem, hogy gyakorlom elállási jogomat az alábbi termék(ek)
                    vásárlására irányuló szerződés tekintetében:<br />
                    - Megrendelés azonosítója: ..................<br />
                    - Termék megnevezése: ..................<br />
                    - Megrendelés dátuma: ..................<br />
                    - Vásárló neve: ..................<br />
                    - Vásárló címe: ..................<br />
                    - Dátum: ..................<br />
                    - Aláírás (csak papír alapú nyilatkozat esetén):
                  </p>
                </div>
              </div>
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
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Vitarendezés és békéltető testület</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">11.1. Panaszkezelés</h3>
                <p>
                  A Szolgáltató és a Vásárló között felmerülő vitás kérdéseket elsősorban békés
                  úton, egyeztetés útján kívánjuk rendezni.
                </p>
                <p className="mt-2">
                  Panasz esetén kérjük, vegye fel velünk a kapcsolatot emailben (vintagevibeshungary@gmail.com) vagy telefonon.
                  Panaszát kivizsgáljuk és 30 napon belül írásban válaszolunk.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">11.2. Fogyasztóvédelmi hatóság</h3>
                <p className="mb-2">
                  Fogyasztói jogvita esetén panasszal fordulhat a fogyasztóvédelmi hatósághoz:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p>
                    <strong>Nemzeti Fogyasztóvédelmi Hatóság</strong><br />
                    Székhely: 1088 Budapest, József krt. 6.<br />
                    Telefon: +36 1 459 4800<br />
                    E-mail: nfh@nfh.gov.hu<br />
                    Weboldal: <a href="https://www.nfh.hu" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">www.nfh.hu</a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">11.3. Békéltető testület</h3>
                <p className="mb-2">
                  A fogyasztó a Szolgáltató székhelye szerint illetékes békéltető testülethez fordulhat
                  a fogyasztói jogvita bírósági eljáráson kívüli rendezése érdekében. A békéltető testület
                  feladata a fogyasztói jogvita bírósági eljáráson kívüli rendezésének megkísérlése.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <p>
                    <strong>Veszprém Vármegyei Békéltető Testület</strong><br />
                    (a Szolgáltató székhelye szerint illetékes)<br /><br />
                    Székhely: 8200 Veszprém, Radnóti tér 1.<br />
                    Levelezési cím: 8201 Veszprém, Pf. 483.<br />
                    Telefon: (88) 814-008<br />
                    E-mail: bekelteto@vkik.hu<br />
                    Weboldal: <a href="http://www.bekeltetesveszprem.hu" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">www.bekeltetesveszprem.hu</a>
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  A fogyasztó a lakóhelye vagy tartózkodási helye szerint illetékes békéltető testülethez is fordulhat.
                  A békéltető testületek listája elérhető a{' '}
                  <a href="https://www.nfh.hu" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">www.nfh.hu</a>
                  {' '}weboldalon.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">11.4. Online Vitarendezési Platform</h3>
                <p className="mb-2">
                  Az Európai Bizottság online vitarendezési platformja elérhető az online vásárlással
                  kapcsolatos jogviták bírósági eljáráson kívüli rendezése érdekében:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 underline font-semibold"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  E-mail címünk: vintagevibeshungary@gmail.com
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Irányadó jog és jogszabályok</h2>
            <p className="mb-2">
              Jelen ÁSZF-re és a felek közötti jogviszonyra a magyar jog az irányadó, különösen
              az alábbi jogszabályok:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>2013. évi V. törvény a Polgári Törvénykönyvről</li>
              <li>45/2014. (II. 26.) Korm. rendelet a fogyasztó és a vállalkozás közötti szerződések részletes szabályairól</li>
              <li>151/2003. (IX. 22.) Korm. rendelet a tartós fogyasztási cikkekre vonatkozó kötelező jótállásról</li>
              <li>2001. évi CVIII. törvény az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről</li>
              <li>2008. évi XLVIII. törvény a gazdasági reklámtevékenység alapvető feltételeiről és egyes korlátairól</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Vegyes rendelkezések</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Az ÁSZF módosításának jogát a Szolgáltató fenntartja</li>
              <li>A módosított ÁSZF a weboldalon történő közzététel napján lép hatályba</li>
              <li>A már leadott rendelésekre a megrendelés időpontjában hatályos ÁSZF vonatkozik</li>
              <li>Az ÁSZF bármely pontjának érvénytelensége nem érinti a többi pont érvényességét</li>
              <li>A jelen ÁSZF-ben nem szabályozott kérdésekben a magyar jog az irányadó</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Kapcsolat</h2>
            <p>
              Kérdés, probléma vagy reklamáció esetén vegye fel velünk a kapcsolatot:
            </p>
            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <p>
                <strong>Péntek Dávid EV</strong><br />
                <strong>Email:</strong> vintagevibeshungary@gmail.com<br />
                {settings?.company_phone && (
                  <>
                    <strong>Telefon:</strong> {settings.company_phone}<br />
                  </>
                )}
                <strong>Postai cím:</strong> 8446 Kislőd, Bocskay utca 14.<br />
                <strong>Adószám:</strong> 46362078
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Törekszünk arra, hogy minden megkeresésre 48 órán belül válaszoljunk.
            </p>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
