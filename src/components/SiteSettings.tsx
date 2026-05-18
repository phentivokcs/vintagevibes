import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';

type SiteSettingsProps = {
  settings: {
    id: string;
    hero_image: string;
    hero_title: string;
    hero_subtitle: string;
    hero_tags: string[];
    primary_button_text: string;
    secondary_button_text: string;
    footer_logo: string;
    barion_logo: string;
    barion_pos_key?: string;
    barion_pixel_id?: string;
    barion_environment?: string;
    barion_payee_email?: string;
    company_phone?: string;
    company_registration_number?: string;
    packeta_api_key?: string;
    packeta_api_password?: string;
    packeta_api_id?: string;
    packeta_sender_name?: string;
    packeta_sender_phone?: string;
    packeta_enabled?: boolean;
    billingo_api_key?: string;
    billingo_block_id?: string;
    billingo_enabled?: boolean;
  } | null;
  onSettingsUpdated: () => void;
};

export function SiteSettings({ settings, onSettingsUpdated }: SiteSettingsProps) {
  const [formData, setFormData] = useState({
    hero_image: settings?.hero_image || '/chatgpt_image_2025._nov._9._01_19_15.png',
    hero_title: settings?.hero_title || 'Archív streetwear. Exkluzív darabok.',
    hero_subtitle: settings?.hero_subtitle || 'Nike / Tommy / TNF / adidas – kézzel válogatva, felmérve, azonnal szállítható.',
    hero_tags: settings?.hero_tags.join(', ') || 'válogatott vintage, 90-es évek, napi újdonságok',
    primary_button_text: settings?.primary_button_text || 'Vásárlás',
    secondary_button_text: settings?.secondary_button_text || 'Újdonságok',
    footer_logo: settings?.footer_logo || '/medium-nobg-light.png',
    barion_logo: settings?.barion_logo || '/medium-nobg-light.png',
    barion_pos_key: settings?.barion_pos_key || '',
    barion_pixel_id: settings?.barion_pixel_id || '',
    barion_environment: settings?.barion_environment || 'test',
    barion_payee_email: settings?.barion_payee_email || '',
    company_phone: settings?.company_phone || '',
    company_registration_number: settings?.company_registration_number || '',
    packeta_api_key: settings?.packeta_api_key || '',
    packeta_api_password: settings?.packeta_api_password || '',
    packeta_api_id: settings?.packeta_api_id || '',
    packeta_sender_name: settings?.packeta_sender_name || '',
    packeta_sender_phone: settings?.packeta_sender_phone || '',
    packeta_enabled: settings?.packeta_enabled || false,
    billingo_api_key: settings?.billingo_api_key || '',
    billingo_block_id: settings?.billingo_block_id || '',
    billingo_enabled: settings?.billingo_enabled || false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        hero_image: settings.hero_image,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        hero_tags: settings.hero_tags.join(', '),
        primary_button_text: settings.primary_button_text,
        secondary_button_text: settings.secondary_button_text,
        footer_logo: settings.footer_logo,
        barion_logo: settings.barion_logo,
        barion_pos_key: settings.barion_pos_key || '',
        barion_pixel_id: settings.barion_pixel_id || '',
        barion_environment: settings.barion_environment || 'test',
        barion_payee_email: settings.barion_payee_email || '',
        company_phone: settings.company_phone || '',
        company_registration_number: settings.company_registration_number || '',
        packeta_api_key: settings.packeta_api_key || '',
        packeta_api_password: settings.packeta_api_password || '',
        packeta_api_id: settings.packeta_api_id || '',
        packeta_sender_name: settings.packeta_sender_name || '',
        packeta_sender_phone: settings.packeta_sender_phone || '',
        packeta_enabled: settings.packeta_enabled || false,
        billingo_api_key: settings.billingo_api_key || '',
        billingo_block_id: settings.billingo_block_id || '',
        billingo_enabled: settings.billingo_enabled || false,
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tags = formData.hero_tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error } = await supabase
        .from('site_settings')
        .update({
          hero_image: formData.hero_image,
          hero_title: formData.hero_title,
          hero_subtitle: formData.hero_subtitle,
          hero_tags: tags,
          primary_button_text: formData.primary_button_text,
          secondary_button_text: formData.secondary_button_text,
          footer_logo: formData.footer_logo,
          barion_logo: formData.barion_logo,
          barion_pos_key: formData.barion_pos_key,
          barion_pixel_id: formData.barion_pixel_id,
          barion_environment: formData.barion_environment,
          barion_payee_email: formData.barion_payee_email,
          company_phone: formData.company_phone,
          company_registration_number: formData.company_registration_number,
          packeta_api_key: formData.packeta_api_key,
          packeta_api_password: formData.packeta_api_password,
          packeta_api_id: formData.packeta_api_id,
          packeta_sender_name: formData.packeta_sender_name,
          packeta_sender_phone: formData.packeta_sender_phone,
          packeta_enabled: formData.packeta_enabled,
          billingo_api_key: formData.billingo_api_key,
          billingo_block_id: formData.billingo_block_id,
          billingo_enabled: formData.billingo_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings?.id);

      if (!error) {
        onSettingsUpdated();
        alert('Beállítások sikeresen mentve!');
      } else {
        alert('Sikertelen mentés: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Sikertelen mentés');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData({ ...formData, hero_image: urls[0] });
    }
  };

  const handleFooterLogoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData({ ...formData, footer_logo: urls[0] });
    }
  };

  const handleBarionLogoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData({ ...formData, barion_logo: urls[0] });
    }
  };

  return (
    <div className="card2 p-4 sm:p-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h3 className="text-base font-extrabold mb-4">Hero banner beállítások</h3>
          <p className="muted text-sm mb-4">Az oldal fő hero szekciójának testreszabása</p>
        </div>

        <div>
          <label className="space-y-2">
            <span className="muted text-xs uppercase tracking-wider">Hero banner kép</span>
            <div className="space-y-3">
              {formData.hero_image && (
                <div className="relative w-full h-48 border border-zinc-200 rounded-lg overflow-hidden">
                  <img
                    src={formData.hero_image}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <ImageUpload
                existingImages={formData.hero_image ? [formData.hero_image] : []}
                onImagesUploaded={handleImageUpload}
              />
              <p className="muted text-xs">Új hero banner kép feltöltése (ajánlott: 1920x600px)</p>
            </div>
          </label>
        </div>

        <div className="grid gap-4">
          <label className="space-y-1">
            <span className="muted text-xs uppercase tracking-wider">Hero cím *</span>
            <input
              type="text"
              required
              value={formData.hero_title}
              onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
              className="input"
              placeholder="Archív streetwear. Exkluzív darabok."
            />
          </label>

          <label className="space-y-1">
            <span className="muted text-xs uppercase tracking-wider">Hero alcím *</span>
            <input
              type="text"
              required
              value={formData.hero_subtitle}
              onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
              className="input"
              placeholder="Nike / Tommy / TNF / adidas – kézzel válogatva, felmérve, azonnal szállítható."
            />
          </label>

          <label className="space-y-1">
            <span className="muted text-xs uppercase tracking-wider">Hero címkék</span>
            <input
              type="text"
              value={formData.hero_tags}
              onChange={(e) => setFormData({ ...formData, hero_tags: e.target.value })}
              className="input"
              placeholder="válogatott vintage, 90-es évek, napi újdonságok"
            />
            <p className="muted text-xs">Vesszővel válaszd el a címkéket</p>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="muted text-xs uppercase tracking-wider">Elsődleges gomb szövege *</span>
            <input
              type="text"
              required
              value={formData.primary_button_text}
              onChange={(e) => setFormData({ ...formData, primary_button_text: e.target.value })}
              className="input"
              placeholder="Vásárlás"
            />
          </label>

          <label className="space-y-1">
            <span className="muted text-xs uppercase tracking-wider">Másodlagos gomb szövege *</span>
            <input
              type="text"
              required
              value={formData.secondary_button_text}
              onChange={(e) => setFormData({ ...formData, secondary_button_text: e.target.value })}
              className="input"
              placeholder="Újdonságok"
            />
          </label>
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <h3 className="text-base font-extrabold mb-4">Footer beállítások</h3>
          <p className="muted text-sm mb-4">A láblécben megjelenő logó testreszabása</p>

          <label className="space-y-2">
            <span className="muted text-xs uppercase tracking-wider">Footer logó</span>
            <div className="space-y-3">
              {formData.footer_logo && (
                <div className="relative w-full h-32 border border-zinc-200 rounded-lg overflow-hidden bg-white p-4 flex items-center justify-center">
                  <img
                    src={formData.footer_logo}
                    alt="Footer logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <ImageUpload
                existingImages={formData.footer_logo ? [formData.footer_logo] : []}
                onImagesUploaded={handleFooterLogoUpload}
              />
              <p className="muted text-xs">Új footer logó feltöltése</p>
            </div>
          </label>
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <h3 className="text-base font-extrabold mb-4">Szállítási beállítások</h3>
          <p className="muted text-sm mb-4">Packeta csomagküldés konfigurálása</p>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.packeta_enabled}
                onChange={(e) => setFormData({ ...formData, packeta_enabled: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300"
              />
              <span className="text-sm">Packeta szállítás engedélyezése</span>
            </label>

            {formData.packeta_enabled && (
              <>
                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Packeta API kulcs (Widget) *</span>
                  <input
                    type="text"
                    required={formData.packeta_enabled}
                    value={formData.packeta_api_key}
                    onChange={(e) => setFormData({ ...formData, packeta_api_key: e.target.value })}
                    className="input font-mono text-sm"
                    placeholder="cc2bcdc3c44fc306"
                  />
                  <p className="muted text-xs">A rövid API kulcs (widget inicializáláshoz)</p>
                </label>

                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Packeta API jelszó (Password) *</span>
                  <input
                    type="password"
                    required={formData.packeta_enabled}
                    value={formData.packeta_api_password}
                    onChange={(e) => setFormData({ ...formData, packeta_api_password: e.target.value })}
                    className="input font-mono text-sm"
                    placeholder="cc2bcdc3c44fc306a5310bd64e4b835d"
                  />
                  <p className="muted text-xs">A hosszú API jelszó (csomagfeladáshoz)</p>
                </label>

                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Packeta API ID *</span>
                  <input
                    type="text"
                    required={formData.packeta_enabled}
                    value={formData.packeta_api_id}
                    onChange={(e) => setFormData({ ...formData, packeta_api_id: e.target.value })}
                    className="input"
                    placeholder="API ID vagy felhasználónév"
                  />
                  <p className="muted text-xs">A Packeta fiókod azonosítója</p>
                </label>

                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Feladó neve *</span>
                  <input
                    type="text"
                    required={formData.packeta_enabled}
                    value={formData.packeta_sender_name}
                    onChange={(e) => setFormData({ ...formData, packeta_sender_name: e.target.value })}
                    className="input"
                    placeholder="Vintage Shop Kft."
                  />
                  <p className="muted text-xs">A címkén megjelenő feladó név</p>
                </label>

                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Feladó telefonszáma *</span>
                  <input
                    type="tel"
                    required={formData.packeta_enabled}
                    value={formData.packeta_sender_phone}
                    onChange={(e) => setFormData({ ...formData, packeta_sender_phone: e.target.value })}
                    className="input"
                    placeholder="+36301234567"
                  />
                  <p className="muted text-xs">A címkén megjelenő feladó telefonszám</p>
                </label>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <h3 className="text-base font-extrabold mb-4">Számlázási beállítások</h3>
          <p className="muted text-sm mb-4">Billingo automatikus számlázás konfigurálása</p>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.billingo_enabled}
                onChange={(e) => setFormData({ ...formData, billingo_enabled: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300"
              />
              <span className="text-sm">Billingo automatikus számlázás engedélyezése</span>
            </label>

            {formData.billingo_enabled && (
              <>
                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Billingo API kulcs *</span>
                  <input
                    type="password"
                    required={formData.billingo_enabled}
                    value={formData.billingo_api_key}
                    onChange={(e) => setFormData({ ...formData, billingo_api_key: e.target.value })}
                    className="input font-mono text-sm"
                    placeholder="Billingo API kulcs"
                  />
                  <p className="muted text-xs">A Billingo admin felületről generálható API kulcs</p>
                </label>

                <label className="space-y-1">
                  <span className="muted text-xs uppercase tracking-wider">Billingo Block ID *</span>
                  <input
                    type="text"
                    required={formData.billingo_enabled}
                    value={formData.billingo_block_id}
                    onChange={(e) => setFormData({ ...formData, billingo_block_id: e.target.value })}
                    className="input"
                    placeholder="Billingo Block ID (pl: 1234567890)"
                  />
                  <p className="muted text-xs">A Billingo block azonosító (settings/blocks alatt található)</p>
                </label>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <h3 className="text-base font-extrabold mb-4">Cégadatok és kapcsolat</h3>
          <p className="muted text-sm mb-4">Az ÁSZF-ben megjelenő cégadatok</p>

          <div className="space-y-4">
            <label className="space-y-1">
              <span className="muted text-xs uppercase tracking-wider">Cégjegyzékszám</span>
              <input
                type="text"
                value={formData.company_registration_number}
                onChange={(e) => setFormData({ ...formData, company_registration_number: e.target.value })}
                className="input"
                placeholder="01-09-123456 (Ha nincs, hagyd üresen)"
              />
              <p className="muted text-xs">Ha EV vagy, ezt hagyd üresen</p>
            </label>

            <label className="space-y-1">
              <span className="muted text-xs uppercase tracking-wider">Telefonszám *</span>
              <input
                type="tel"
                required
                value={formData.company_phone}
                onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                className="input"
                placeholder="+36 30 123 4567"
              />
              <p className="muted text-xs">A cég elérhetősége (kötelező a Barion követelmények miatt)</p>
            </label>
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <h3 className="text-base font-extrabold mb-4">Fizetési beállítások</h3>
          <p className="muted text-sm mb-4">Barion fizetési rendszer konfigurálása</p>

          <div className="space-y-4">
            <label className="space-y-1">
              <span className="muted text-xs uppercase tracking-wider">Barion POSKey (API kulcs) *</span>
              <input
                type="password"
                required
                value={formData.barion_pos_key}
                onChange={(e) => setFormData({ ...formData, barion_pos_key: e.target.value })}
                className="input font-mono text-sm"
                placeholder="Barion POSKey (API kulcs)"
              />
              <p className="muted text-xs">A Barion admin felületről kapott API kulcs</p>
            </label>

            <label className="space-y-1">
              <span className="muted text-xs uppercase tracking-wider">Barion Pixel ID</span>
              <input
                type="text"
                value={formData.barion_pixel_id}
                onChange={(e) => setFormData({ ...formData, barion_pixel_id: e.target.value })}
                className="input font-mono text-sm"
                placeholder="BP-1234567890-01"
              />
              <p className="muted text-xs">Barion Pixel azonosító csalásmegelőzéshez (opcionális)</p>
            </label>

            <label className="space-y-1">
              <span className="muted text-xs uppercase tracking-wider">Barion Payee Email (kedvezményezett) *</span>
              <input
                type="email"
                required
                value={formData.barion_payee_email}
                onChange={(e) => setFormData({ ...formData, barion_payee_email: e.target.value })}
                className="input"
                placeholder="shop@example.com"
              />
              <p className="muted text-xs">A Barion-ban regisztrált email cím, aki a pénzt kapja</p>
            </label>

            <label className="space-y-1">
              <span className="muted text-xs uppercase tracking-wider">Környezet *</span>
              <select
                value={formData.barion_environment}
                onChange={(e) => setFormData({ ...formData, barion_environment: e.target.value })}
                className="input"
              >
                <option value="test">Teszt</option>
                <option value="production">Éles</option>
              </select>
              <p className="muted text-xs">Teszt környezet fejlesztéshez, éles éleshez</p>
            </label>

            <label className="space-y-2">
              <span className="muted text-xs uppercase tracking-wider">Barion logó</span>
              <div className="space-y-3">
                {formData.barion_logo && (
                  <div className="relative w-full h-32 border border-zinc-200 rounded-lg overflow-hidden bg-white p-4 flex items-center justify-center">
                    <img
                      src={formData.barion_logo}
                      alt="Barion logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <ImageUpload
                  existingImages={formData.barion_logo ? [formData.barion_logo] : []}
                  onImagesUploaded={handleBarionLogoUpload}
                />
                <p className="muted text-xs">A checkout oldalon megjelenő Barion logó</p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Mentés...' : 'Változtatások mentése'}
          </button>
        </div>
      </form>
    </div>
  );
}
