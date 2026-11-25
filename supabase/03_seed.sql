-- ============================================================
-- Sample categories and products. Run THIRD. Safe to run again.
-- Names, prices and specs are SAMPLES for the demo: replace them
-- with the owner's real catalogue from the admin dashboard.
-- ============================================================

insert into public.categories (name, slug, image_url, sort_order) values
  ('Fridges & Freezers', 'fridges-freezers', '/products/fridge-side.svg', 1),
  ('TVs & Sound',        'tvs-sound',        '/products/tv55.svg',        2),
  ('Washing',            'washing',          '/products/washer.svg',      3),
  ('Cooking',            'cooking',          '/products/cooker.svg',      4),
  ('Cooling & Heating',  'cooling-heating',  '/products/ac.svg',          5),
  ('Small Appliances',   'small-appliances', '/products/airfryer.svg',    6),
  ('Kitchenware',        'kitchenware',      '/products/cookware.svg',    7)
on conflict (slug) do nothing;

insert into public.products
  (name, slug, description, price, compare_at_price, category_id, images, specs, in_stock, is_featured)
select v.name, v.slug, v.description, v.price, v.was::numeric,
       (select id from public.categories c where c.slug = v.cat),
       array['/products/' || v.img || '.svg'], v.specs::jsonb, v.stock, v.feat
from (values
  ('Side-by-Side Fridge 560 L', 'side-by-side-fridge-560l', 'A full-width fridge and freezer with a water dispenser in the door. No-frost cooling keeps both sides clear of ice.', 899.00, 999.00, 'fridges-freezers', 'fridge-side', '[{"label":"Capacity","value":"560 L"},{"label":"Cooling","value":"No frost"},{"label":"Finish","value":"Stainless steel"},{"label":"Water dispenser","value":"Yes"}]', true, true),
  ('Top-Freezer Fridge 386 L', 'top-freezer-fridge-386l', 'A family-size fridge with a separate top freezer and a digital temperature panel on the door.', 459.00, null, 'fridges-freezers', 'fridge-top', '[{"label":"Capacity","value":"386 L"},{"label":"Cooling","value":"No frost"},{"label":"Finish","value":"Black"}]', true, false),
  ('Chest Freezer 300 L', 'chest-freezer-300l', 'Deep storage for bulk shopping, with a lock and an easy-drain outlet.', 329.00, null, 'fridges-freezers', 'freezer', '[{"label":"Capacity","value":"300 L"},{"label":"Defrost","value":"Manual"},{"label":"Lock","value":"Yes"}]', true, false),
  ('Water Dispenser with Cabinet', 'water-dispenser-cabinet', 'Hot, cold and room-temperature taps above a storage cabinet.', 145.00, 165.00, 'fridges-freezers', 'water', '[{"label":"Taps","value":"Hot, normal, cold"},{"label":"Loading","value":"Top"}]', true, false),
  ('55" 4K Smart TV', '55-4k-smart-tv', 'Sharp 4K picture with built-in Wi-Fi and streaming apps.', 389.00, 449.00, 'tvs-sound', 'tv55', '[{"label":"Screen","value":"55 inch"},{"label":"Resolution","value":"3840 x 2160"},{"label":"Smart TV","value":"Yes"},{"label":"Ports","value":"3 HDMI, 2 USB"}]', true, true),
  ('43" Full HD Smart TV', '43-full-hd-smart-tv', 'The right size for a bedroom or a small living room, with streaming apps built in.', 239.00, null, 'tvs-sound', 'tv43', '[{"label":"Screen","value":"43 inch"},{"label":"Resolution","value":"1920 x 1080"},{"label":"Smart TV","value":"Yes"}]', true, false),
  ('Bluetooth Soundbar 120 W', 'bluetooth-soundbar-120w', 'Fuller sound for films and music. Connects by HDMI, optical or Bluetooth.', 89.00, null, 'tvs-sound', 'soundbar', '[{"label":"Power","value":"120 W"},{"label":"Connections","value":"HDMI ARC, optical, Bluetooth"}]', true, false),
  ('Front-Load Washing Machine 8 kg', 'front-load-washing-machine-8kg', 'A quiet 8 kg washer with a quick cycle for everyday loads.', 379.00, 420.00, 'washing', 'washer', '[{"label":"Capacity","value":"8 kg"},{"label":"Spin speed","value":"1200 rpm"},{"label":"Programs","value":"15"}]', true, true),
  ('Dishwasher 14 Place Settings', 'dishwasher-14-settings', 'Three racks and a half-load option, in a stainless steel finish.', 425.00, null, 'washing', 'dishwasher', '[{"label":"Capacity","value":"14 place settings"},{"label":"Programs","value":"8"},{"label":"Width","value":"60 cm"}]', true, false),
  ('Steam Iron 2400 W', 'steam-iron-2400w', 'Strong continuous steam with a non-stick soleplate.', 32.00, null, 'washing', 'iron', '[{"label":"Power","value":"2400 W"},{"label":"Soleplate","value":"Non-stick"}]', true, false),
  ('Gas Cooker 60 x 90 cm', 'gas-cooker-60x90', 'Five burners and a wide oven with full safety on every burner.', 549.00, 620.00, 'cooking', 'cooker', '[{"label":"Size","value":"60 x 90 cm"},{"label":"Burners","value":"5"},{"label":"Safety","value":"Full safety"},{"label":"Finish","value":"Stainless steel"}]', true, true),
  ('Microwave Oven 30 L', 'microwave-oven-30l', 'Digital microwave with grill and auto-cook menus.', 129.00, null, 'cooking', 'microwave', '[{"label":"Capacity","value":"30 L"},{"label":"Power","value":"900 W"},{"label":"Grill","value":"Yes"}]', true, false),
  ('Chimney Hood 90 cm', 'chimney-hood-90', 'A stainless steel hood with three speeds and LED lights.', 159.00, null, 'cooking', 'hood', '[{"label":"Width","value":"90 cm"},{"label":"Speeds","value":"3"}]', false, false),
  ('Split Air Conditioner 12000 BTU', 'split-ac-12000-btu', 'Inverter cooling and heating for a medium room.', 419.00, 469.00, 'cooling-heating', 'ac', '[{"label":"Power","value":"12000 BTU"},{"label":"Type","value":"Inverter"},{"label":"Modes","value":"Cool, heat, dry, fan"}]', true, true),
  ('Electric Heater 2000 W', 'electric-heater-2000w', 'Four quartz elements, two heat settings and tip-over protection.', 45.00, null, 'cooling-heating', 'heater', '[{"label":"Power","value":"2000 W"},{"label":"Heat settings","value":"2"}]', true, false),
  ('Stand Fan 18"', 'stand-fan-18', 'Adjustable height with three speeds and wide oscillation.', 39.00, 48.00, 'cooling-heating', 'fan', '[{"label":"Size","value":"18 inch"},{"label":"Speeds","value":"3"}]', true, false),
  ('Digital Air Fryer 6 L', 'digital-air-fryer-6l', 'Crisp results with little oil, and a basket big enough for a family.', 85.00, 99.00, 'small-appliances', 'airfryer', '[{"label":"Capacity","value":"6 L"},{"label":"Power","value":"1700 W"},{"label":"Max temperature","value":"200 C"}]', true, true),
  ('Vacuum Cleaner 2000 W', 'vacuum-cleaner-2000w', 'A bagless cylinder vacuum with a washable filter and a long hose.', 95.00, null, 'small-appliances', 'vacuum', '[{"label":"Power","value":"2000 W"},{"label":"Dust capacity","value":"3 L"}]', true, true),
  ('Blender 1.5 L', 'blender-1-5l', 'Glass jar, stainless blades and a pulse setting.', 38.00, null, 'small-appliances', 'blender', '[{"label":"Capacity","value":"1.5 L"},{"label":"Power","value":"600 W"}]', true, false),
  ('Electric Kettle 1.7 L', 'electric-kettle-1-7l', 'Stainless steel kettle with auto shut-off.', 22.00, null, 'small-appliances', 'kettle', '[{"label":"Capacity","value":"1.7 L"},{"label":"Power","value":"2200 W"}]', true, false),
  ('2-Slice Toaster', '2-slice-toaster', 'Wide slots, seven browning levels and a removable crumb tray.', 25.00, null, 'small-appliances', 'toaster', '[{"label":"Slots","value":"2"},{"label":"Browning levels","value":"7"}]', true, false),
  ('Drip Coffee Maker', 'drip-coffee-maker', 'Brews up to 12 cups and keeps the jug warm.', 49.00, null, 'small-appliances', 'coffee', '[{"label":"Capacity","value":"12 cups"},{"label":"Power","value":"900 W"}]', true, false),
  ('Cookware Set, 3 Pots', 'cookware-set-3-pots', 'Three non-stick pots with glass lids, safe for gas and electric hobs.', 79.00, 95.00, 'kitchenware', 'cookware', '[{"label":"Pieces","value":"3 pots, 3 lids"},{"label":"Coating","value":"Non-stick"}]', true, true),
  ('Knife Set with Wooden Block', 'knife-set-wooden-block', 'Four stainless steel kitchen knives in a wooden block.', 35.00, null, 'kitchenware', 'knives', '[{"label":"Pieces","value":"5"},{"label":"Blades","value":"Stainless steel"}]', true, false)
) as v(name, slug, description, price, was, cat, img, specs, stock, feat)
on conflict (slug) do nothing;
