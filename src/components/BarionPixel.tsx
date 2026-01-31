import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function BarionPixel() {
  const [pixelId, setPixelId] = useState<string>('');

  useEffect(() => {
    const loadBarionPixel = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('barion_pixel_id')
        .maybeSingle();

      if (data?.barion_pixel_id) {
        setPixelId(data.barion_pixel_id);

        window['bp'] = window['bp'] || function () {
          (window['bp'].q = window['bp'].q || []).push(arguments);
        };
        window['bp'].l = 1 * new Date().getTime();

        const scriptElement = document.createElement('script');
        const firstScript = document.getElementsByTagName('script')[0];
        scriptElement.async = true;
        scriptElement.src = 'https://pixel.barion.com/bp.js';
        firstScript.parentNode?.insertBefore(scriptElement, firstScript);

        window['barion_pixel_id'] = data.barion_pixel_id;

        window['bp']('init', 'addBarionPixelId', window['barion_pixel_id']);
      }
    };

    loadBarionPixel();
  }, []);

  if (!pixelId) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        alt="Barion Pixel"
        src={`https://pixel.barion.com/a.gif?ba_pixel_id=${pixelId}&ev=contentView&noscript=1`}
      />
    </noscript>
  );
}

declare global {
  interface Window {
    bp: any;
    barion_pixel_id: string;
  }
}
