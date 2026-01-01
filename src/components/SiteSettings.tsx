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
