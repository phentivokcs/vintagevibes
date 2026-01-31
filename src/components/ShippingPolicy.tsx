import { X, Package, Truck, RotateCcw, Clock } from 'lucide-react';

interface ShippingPolicyProps {
  onBack: () => void;
}

export default function ShippingPolicy({ onBack }: ShippingPolicyProps) {
  return (
    <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={onBack}
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
          <h1 className="text-2xl font-bold text-gray-900">Szállítási és Visszaküldési Feltételek</h1>
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-semibold text-gray-900 m-0">1. Szállítási információk</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">1.1. Szállítási terület</h3>
                <p>
                  Jelenleg csak Magyarország területére szállítunk. A szállítás házhozszállítással
                  történik futárszolgálat útján.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">1.2. Szállítási idő</h3>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-amber-700" />
                    <p className="font-semibold text-amber-900 m-0">Várható kézbesítési idő:</p>
                  </div>
                  <ul className="list-disc pl-6 space-y-1 text-amber-900 mt-2">
                    <li><strong>Készpénzes utánvét:</strong> 2-5 munkanap a megrendelés visszaigazolásától</li>
                    <li><strong>Online fizetés/átutalás:</strong> 2-5 munkanap a fizetés beérkezésétől</li>
                  </ul>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  * A szállítási idő tájékoztató jellegű. Ünnepek, nagy forgalom vagy egyéb körülmények
                  miatt a szállítás elhúzódhat, melyről emailben értesítjük.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">1.3. Szállítási költségek</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                          Rendelés értéke
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                          Szállítási díj
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-6 py-4 text-sm text-gray-700">0 - 15 000 Ft</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">1 500 Ft</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-6 py-4 text-sm text-gray-700">15 001 - 30 000 Ft</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">1 200 Ft</td>
                      </tr>
                      <tr className="border-b bg-green-50">
                        <td className="px-6 py-4 text-sm text-gray-700 font-semibold">30 001 Ft felett</td>
                        <td className="px-6 py-4 text-sm text-green-700 font-bold">INGYENES</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">1.4. Csomagolás</h3>
                <p>
                  Minden terméket gondosan csomagolunk, hogy biztonságban megérkezzen hozzád.
                  Használt és újrahasznosított csomagolóanyagokat használunk a környezet védelme
                  érdekében.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">1.5. Átvétel</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A csomag átvételekor kérjük, ellenőrizd a küldemény sértetlenségét</li>
                  <li>Sérült csomag esetén jelezd a futárnak és készíts jegyzőkönyvet</li>
                  <li>Átvétel után a csomag tartalmát azonnal ellenőrizd</li>
                  <li>Utánvétes fizetés esetén csak készpénzt fogadunk el</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-semibold text-gray-900 m-0">2. Visszaküldési feltételek</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1. Elállási jog (14 napos visszaküldés)</h3>
                <p>
                  A fogyasztóvédelmi jogszabályoknak megfelelően, a termék kézhezvételétől számított
                  <strong className="text-amber-600"> 14 napon belül</strong> indokolás nélkül
                  elállhatsz a vásárlástól.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.2. Visszaküldés menete</h3>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Elállási szándék bejelentése:</strong>
                    <p className="mt-1">
                      Küldj emailt a <strong>vintagevibeshungary@gmail.com</strong> címre.
                      Add meg a rendelésszámot és a visszaküldeni kívánt terméket.
                    </p>
                  </li>
                  <li>
                    <strong>Termék visszaküldése:</strong>
                    <p className="mt-1">
                      A terméket eredeti állapotában, címkével, eredeti csomagolásban küldd vissza
                      az alábbi címre:
                    </p>
                    <div className="bg-gray-100 p-3 rounded mt-2">
                      <p className="font-mono text-sm">
                        Péntek Dávid EV<br />
                        Bocskay utca 14.<br />
                        8446 Kislőd
                      </p>
                    </div>
                  </li>
                  <li>
                    <strong>Visszatérítés:</strong>
                    <p className="mt-1">
                      A termék beérkezését és ellenőrzését követően 14 napon belül visszautaljuk
                      a vételárat az általad megadott bankszámlaszámra.
                    </p>
                  </li>
                </ol>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Fontos feltételek:</h3>
                <ul className="list-disc pl-6 space-y-2 text-red-900">
                  <li>A termék legyen <strong>bontatlan, eredeti állapotban</strong></li>
                  <li>Címkék, árcédulák legyenek rajta</li>
                  <li>Ne legyen használat nyoma rajta (parfüm szag, szennyeződés, stb.)</li>
                  <li>A visszaküldés költsége a Vásárlót terheli</li>
                  <li>Ajánlott az értéknyilvánítás és ajánlott küldemény</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.3. Mikor NEM élhetsz az elállási joggal?</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ha a termék használt állapotban, sérülten érkezik vissza</li>
                  <li>Ha a termék nem eredeti csomagolásban van</li>
                  <li>Ha a címkék hiányoznak vagy sérültek</li>
                  <li>Ha a termék használati nyomokat visel (mosott, parfümözött, foltos)</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  Ilyen esetben a terméket visszaküldjük neked a visszaküldés költségének
                  viselésével, és a vételár nem kerül visszatérítésre.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">2.4. Csere</h3>
                <p>
                  Mivel a termékeink egyedi vintage és használt darabok, cserére nincs lehetőség.
                  Kérjük, gondosan válogass a megrendelés előtt!
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-semibold text-gray-900 m-0">3. Reklamáció</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1. Mikor reklamálhatsz?</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A termék a leírásban nem szereplő hibával rendelkezik</li>
                  <li>Rossz terméket kaptál</li>
                  <li>A csomag sérült állapotban érkezett</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2. Reklamáció menete</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    Készíts részletes fényképeket a hibáról/problémáról
                  </li>
                  <li>
                    Küldd el a fényképeket és a rendelésszámot a <strong>vintagevibeshungary@gmail.com</strong> címre
                  </li>
                  <li>
                    3 munkanapon belül válaszolunk és megoldjuk a problémát
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3.3. Reklamáció határideje</h3>
                <p>
                  A termék átvételétől számított <strong>3 napon belül</strong> jelezd a hibát.
                  Ezen időn túl csak rejtett hiba esetén fogadunk el reklamációt.
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold mb-2">Nem képezi reklamáció alapját:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>A termékleírásban feltüntetett használati nyomok</li>
                  <li>A vintage termékek korából adódó patina</li>
                  <li>Szubjektív vélemény (pl. "nem olyan, mint vártam")</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Kapcsolat</h2>
            <p className="mb-4">Kérdés esetén bátran keress minket:</p>
            <div className="bg-gray-100 p-6 rounded-lg">
              <p>
                <strong>Email:</strong> vintagevibeshungary@gmail.com<br />
                <strong>Cím:</strong> 8446 Kislőd, Bocskay utca 14.
              </p>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
