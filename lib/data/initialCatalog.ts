import { Category, Product } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    "id": "women-co-ords",
    "name": "Co-ords",
    "slug": "women-co-ords",
    "description": "Easy sets designed to move together.",
    "gender": "women",
    "image": "/media/products/women-5.jpg"
  },
  {
    "id": "women-dresses",
    "name": "Dresses",
    "slug": "women-dresses",
    "description": "Fluid silhouettes for evenings and everyday.",
    "gender": "women",
    "image": "/media/products/women-1.jpg"
  },
  {
    "id": "men-jeans",
    "name": "Jeans",
    "slug": "men-jeans",
    "description": "Denim built around fit and fade.",
    "gender": "men",
    "image": "/media/products/men-4.jpg"
  },
  {
    "id": "women-outerwear",
    "name": "Outerwear",
    "slug": "women-outerwear",
    "description": "Coats and layers with quiet presence.",
    "gender": "women",
    "image": "/media/products/women-3.jpg"
  },
  {
    "id": "men-outerwear",
    "name": "Outerwear",
    "slug": "men-outerwear",
    "description": "Jackets and layers made to age well.",
    "gender": "men",
    "image": "/media/products/men-5.jpg"
  },
  {
    "id": "men-shirts",
    "name": "Shirts",
    "slug": "men-shirts",
    "description": "Structured shirting with an easy hand.",
    "gender": "men",
    "image": "/media/products/men-2.jpg"
  },
  {
    "id": "men-sweatshirts",
    "name": "Sweatshirts",
    "slug": "men-sweatshirts",
    "description": "Loopback comfort in considered cuts.",
    "gender": "men",
    "image": "/media/products/knit-1.jpg"
  },
  {
    "id": "men-tshirts",
    "name": "T-Shirts",
    "slug": "men-tshirts",
    "description": "Weighted cotton, clean lines, daily rotation.",
    "gender": "men",
    "image": "/media/products/men-1.jpg"
  },
  {
    "id": "women-trousers",
    "name": "Trousers",
    "slug": "women-trousers",
    "description": "Tailored ease, from desk to dinner.",
    "gender": "women",
    "image": "/media/products/trouser-1.jpg"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "the-column-gown",
    "name": "The Column Gown",
    "slug": "the-column-gown",
    "description": "Cut on a narrow column and finished with a soft square neckline, this floor-length gown moves with a quiet, deliberate fluidity. The weighted viscose blend holds its drape without cling, making it as at home at a seated dinner as it is on a dance floor.",
    "shortDescription": "A floor-sweeping column in fluid crimson with a clean square neck.",
    "gender": "women",
    "pricePaise": 489000,
    "compareAtPricePaise": 689000,
    "material": "78% LENZING™ ECOVERO™ viscose, 22% recycled polyester",
    "fit": "Column fit, true to size",
    "pattern": "Solid",
    "care": "Dry clean only. Steam gently. Store folded in tissue.",
    "keywords": "gown evening dress red occasion women",
    "featured": true,
    "category": "women-dresses",
    "categoryName": "Dresses",
    "images": [
      {
        "url": "/media/products/women-1.jpg",
        "alt": "The Column Gown — view 1"
      },
      {
        "url": "/media/products/women-1-detail.jpg",
        "alt": "The Column Gown — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-THE-COLUMN-GOWN-CRI-XS",
        "size": "XS",
        "colorName": "Crimson",
        "colorHex": "#8a1f2b",
        "stock": 8
      },
      {
        "sku": "XV-THE-COLUMN-GOWN-CRI-S",
        "size": "S",
        "colorName": "Crimson",
        "colorHex": "#8a1f2b",
        "stock": 9
      },
      {
        "sku": "XV-THE-COLUMN-GOWN-CRI-M",
        "size": "M",
        "colorName": "Crimson",
        "colorHex": "#8a1f2b",
        "stock": 9
      },
      {
        "sku": "XV-THE-COLUMN-GOWN-CRI-L",
        "size": "L",
        "colorName": "Crimson",
        "colorHex": "#8a1f2b",
        "stock": 9
      },
      {
        "sku": "XV-THE-COLUMN-GOWN-CRI-XL",
        "size": "XL",
        "colorName": "Crimson",
        "colorHex": "#8a1f2b",
        "stock": 2
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": true
  },
  {
    "id": "fleur-bias-midi",
    "name": "Fleur Bias Midi",
    "slug": "fleur-bias-midi",
    "description": "An easy bias cut, a fine botanical print and a softly cowled back define this midi. It’s lined through the body, finished with adjustable straps, and designed to pair with knitwear now and sandals later.",
    "shortDescription": "A bias-cut midi in a muted botanical print, made to catch the light.",
    "gender": "women",
    "pricePaise": 329000,
    "compareAtPricePaise": 399000,
    "material": "100% recycled polyester crêpe",
    "fit": "Bias-cut, regular fit",
    "pattern": "Botanical",
    "care": "Hand wash cold. Dry in shade. Cool iron on reverse.",
    "keywords": "midi dress floral summer women",
    "featured": true,
    "category": "women-dresses",
    "categoryName": "Dresses",
    "images": [
      {
        "url": "/media/products/women-2.jpg",
        "alt": "Fleur Bias Midi — view 1"
      },
      {
        "url": "/media/products/women-2-detail.jpg",
        "alt": "Fleur Bias Midi — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-FLEUR-BIAS-MIDI-BOT-XS",
        "size": "XS",
        "colorName": "Botanical",
        "colorHex": "#c8b9a6",
        "stock": 12
      },
      {
        "sku": "XV-FLEUR-BIAS-MIDI-BOT-S",
        "size": "S",
        "colorName": "Botanical",
        "colorHex": "#c8b9a6",
        "stock": 12
      },
      {
        "sku": "XV-FLEUR-BIAS-MIDI-BOT-M",
        "size": "M",
        "colorName": "Botanical",
        "colorHex": "#c8b9a6",
        "stock": 12
      },
      {
        "sku": "XV-FLEUR-BIAS-MIDI-BOT-L",
        "size": "L",
        "colorName": "Botanical",
        "colorHex": "#c8b9a6",
        "stock": 12
      },
      {
        "sku": "XV-FLEUR-BIAS-MIDI-BOT-XL",
        "size": "XL",
        "colorName": "Botanical",
        "colorHex": "#c8b9a6",
        "stock": 12
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "atlas-wrap-coat",
    "name": "Atlas Wrap Coat",
    "slug": "atlas-wrap-coat",
    "description": "The Atlas is built for the in-between months: a wool blend with enough weight to hold its line, cut in a wrap silhouette with a deep lapel and self belt. The lining is smooth enough to layer over knitwear without friction.",
    "shortDescription": "A belted wool-blend wrap coat with a softly structured shoulder.",
    "gender": "women",
    "pricePaise": 799000,
    "compareAtPricePaise": 999000,
    "material": "62% wool, 30% recycled polyester, 8% viscose",
    "fit": "Relaxed wrap fit",
    "pattern": "Solid",
    "care": "Dry clean only. Brush after wear and air between uses.",
    "keywords": "wool coat wrap winter women",
    "featured": true,
    "category": "women-outerwear",
    "categoryName": "Outerwear",
    "images": [
      {
        "url": "/media/products/women-3.jpg",
        "alt": "Atlas Wrap Coat — view 1"
      },
      {
        "url": "/media/products/women-3-detail.jpg",
        "alt": "Atlas Wrap Coat — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-ATLAS-WRAP-COAT-CHA-S",
        "size": "S",
        "colorName": "Charcoal",
        "colorHex": "#3a3733",
        "stock": 6
      },
      {
        "sku": "XV-ATLAS-WRAP-COAT-CAM-S",
        "size": "S",
        "colorName": "Camel",
        "colorHex": "#b89b76",
        "stock": 2
      },
      {
        "sku": "XV-ATLAS-WRAP-COAT-CAM-M",
        "size": "M",
        "colorName": "Camel",
        "colorHex": "#b89b76",
        "stock": 6
      },
      {
        "sku": "XV-ATLAS-WRAP-COAT-CHA-M",
        "size": "M",
        "colorName": "Charcoal",
        "colorHex": "#3a3733",
        "stock": 6
      },
      {
        "sku": "XV-ATLAS-WRAP-COAT-CAM-L",
        "size": "L",
        "colorName": "Camel",
        "colorHex": "#b89b76",
        "stock": 6
      },
      {
        "sku": "XV-ATLAS-WRAP-COAT-CHA-L",
        "size": "L",
        "colorName": "Charcoal",
        "colorHex": "#3a3733",
        "stock": 6
      },
      {
        "sku": "XV-ATLAS-WRAP-COAT-CAM-XL",
        "size": "XL",
        "colorName": "Camel",
        "colorHex": "#b89b76",
        "stock": 6
      },
      {
        "sku": "XV-ATLAS-WRAP-COAT-CHA-XL",
        "size": "XL",
        "colorName": "Charcoal",
        "colorHex": "#3a3733",
        "stock": 6
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "ember-longline-coat",
    "name": "Ember Longline Coat",
    "slug": "ember-longline-coat",
    "description": "Strong colour, restrained shape. The Ember falls just below the knee with a clean edge-to-edge front and a soft brushed finish. It’s the one layer that makes a simple outfit feel considered.",
    "shortDescription": "A longline wool coat in deep ember, cut for the cold.",
    "gender": "women",
    "pricePaise": 849000,
    "compareAtPricePaise": 1049000,
    "material": "70% wool, 25% recycled polyamide, 5% cashmere",
    "fit": "Straight longline fit",
    "pattern": "Solid",
    "care": "Dry clean only. Store on a wide hanger.",
    "keywords": "red coat long wool winter women",
    "featured": false,
    "category": "women-outerwear",
    "categoryName": "Outerwear",
    "images": [
      {
        "url": "/media/products/hero-b.jpg",
        "alt": "Ember Longline Coat — view 1"
      },
      {
        "url": "/media/products/hero-b-detail.jpg",
        "alt": "Ember Longline Coat — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-EMBER-LONGLINE-COAT-EMB-S",
        "size": "S",
        "colorName": "Ember",
        "colorHex": "#7a2e2e",
        "stock": 7
      },
      {
        "sku": "XV-EMBER-LONGLINE-COAT-EMB-M",
        "size": "M",
        "colorName": "Ember",
        "colorHex": "#7a2e2e",
        "stock": 7
      },
      {
        "sku": "XV-EMBER-LONGLINE-COAT-EMB-L",
        "size": "L",
        "colorName": "Ember",
        "colorHex": "#7a2e2e",
        "stock": 7
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "solstice-track-set",
    "name": "Solstice Track Set",
    "slug": "solstice-track-set",
    "description": "Soft brushed jersey, an easy cropped zip jacket and a relaxed straight-leg trouser. Sold as a set. Wear together or split across your wardrobe — the saffron works surprisingly hard.",
    "shortDescription": "A brushed jersey set in saffron, made for slow Sundays and travel days.",
    "gender": "women",
    "pricePaise": 289000,
    "compareAtPricePaise": 349000,
    "material": "84% organic cotton, 16% recycled polyester",
    "fit": "Relaxed set, true to size",
    "pattern": "Solid",
    "care": "Machine wash cold with like colours. Tumble dry low.",
    "keywords": "co-ord tracksuit set yellow women loungewear",
    "featured": true,
    "category": "women-co-ords",
    "categoryName": "Co-ords",
    "images": [
      {
        "url": "/media/products/women-5.jpg",
        "alt": "Solstice Track Set — view 1"
      },
      {
        "url": "/media/products/women-5-detail.jpg",
        "alt": "Solstice Track Set — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-SOLSTICE-TRACK-SET-SAF-XS",
        "size": "XS",
        "colorName": "Saffron",
        "colorHex": "#d9a63b",
        "stock": 10
      },
      {
        "sku": "XV-SOLSTICE-TRACK-SET-SAF-S",
        "size": "S",
        "colorName": "Saffron",
        "colorHex": "#d9a63b",
        "stock": 10
      },
      {
        "sku": "XV-SOLSTICE-TRACK-SET-SAF-M",
        "size": "M",
        "colorName": "Saffron",
        "colorHex": "#d9a63b",
        "stock": 10
      },
      {
        "sku": "XV-SOLSTICE-TRACK-SET-SAF-L",
        "size": "L",
        "colorName": "Saffron",
        "colorHex": "#d9a63b",
        "stock": 10
      },
      {
        "sku": "XV-SOLSTICE-TRACK-SET-SAF-XL",
        "size": "XL",
        "colorName": "Saffron",
        "colorHex": "#d9a63b",
        "stock": 10
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "nocturne-wool-overcoat",
    "name": "Nocturne Wool Overcoat",
    "slug": "nocturne-wool-overcoat",
    "description": "A quiet investment layer. Double-faced wool means no lining and a lighter feel, while the hand-finished edges keep the silhouette clean. Deep pockets, a hidden placket and a relaxed shoulder do the rest.",
    "shortDescription": "A double-faced wool overcoat with an unlined, hand-finished edge.",
    "gender": "women",
    "pricePaise": 999000,
    "compareAtPricePaise": null,
    "material": "90% wool, 10% recycled polyamide",
    "fit": "Relaxed overcoat fit",
    "pattern": "Solid",
    "care": "Dry clean sparingly. Air and brush between wears.",
    "keywords": "black overcoat wool winter women",
    "featured": false,
    "category": "women-outerwear",
    "categoryName": "Outerwear",
    "images": [
      {
        "url": "/media/products/women-6.jpg",
        "alt": "Nocturne Wool Overcoat — view 1"
      },
      {
        "url": "/media/products/women-6-detail.jpg",
        "alt": "Nocturne Wool Overcoat — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-NOCTURNE-WOOL-OVERCOAT-INK-S",
        "size": "S",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 8
      },
      {
        "sku": "XV-NOCTURNE-WOOL-OVERCOAT-INK-M",
        "size": "M",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 8
      },
      {
        "sku": "XV-NOCTURNE-WOOL-OVERCOAT-INK-L",
        "size": "L",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 8
      },
      {
        "sku": "XV-NOCTURNE-WOOL-OVERCOAT-INK-XL",
        "size": "XL",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 8
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "azure-trench",
    "name": "Azure Trench",
    "slug": "azure-trench",
    "description": "A lighter take on the trench: washed cotton twill, a softly dropped shoulder and a full belt. The pale blue is garment-dyed, so each piece settles into its own subtle tone with wear.",
    "shortDescription": "A soft-shouldered cotton trench in a washed sky blue.",
    "gender": "women",
    "pricePaise": 749000,
    "compareAtPricePaise": 899000,
    "material": "100% cotton twill, garment dyed",
    "fit": "Oversized trench fit",
    "pattern": "Solid",
    "care": "Machine wash cold, separately. Line dry in shade.",
    "keywords": "trench coat blue cotton women",
    "featured": false,
    "category": "women-outerwear",
    "categoryName": "Outerwear",
    "images": [
      {
        "url": "/media/products/hero-a.jpg",
        "alt": "Azure Trench — view 1"
      },
      {
        "url": "/media/products/hero-a-detail.jpg",
        "alt": "Azure Trench — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-AZURE-TRENCH-CIE-XS",
        "size": "XS",
        "colorName": "Cielo",
        "colorHex": "#89aec5",
        "stock": 9
      },
      {
        "sku": "XV-AZURE-TRENCH-CIE-S",
        "size": "S",
        "colorName": "Cielo",
        "colorHex": "#89aec5",
        "stock": 9
      },
      {
        "sku": "XV-AZURE-TRENCH-CIE-M",
        "size": "M",
        "colorName": "Cielo",
        "colorHex": "#89aec5",
        "stock": 9
      },
      {
        "sku": "XV-AZURE-TRENCH-CIE-L",
        "size": "L",
        "colorName": "Cielo",
        "colorHex": "#89aec5",
        "stock": 9
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": true
  },
  {
    "id": "pleat-front-trouser",
    "name": "Pleat-Front Trouser",
    "slug": "pleat-front-trouser",
    "description": "A fluid crepe trouser with two soft front pleats and a clean high waist. The leg tapers just enough to look polished without losing ease. Side pockets and a hidden hook closure keep the line quiet.",
    "shortDescription": "A high-rise, pleat-front trouser with a tapered ankle.",
    "gender": "women",
    "pricePaise": 289000,
    "compareAtPricePaise": null,
    "material": "70% LENZING™ ECOVERO™ viscose, 30% recycled polyester",
    "fit": "High rise, tapered leg",
    "pattern": "Solid",
    "care": "Dry clean or hand wash cold. Hang to dry.",
    "keywords": "trousers pants pink workwear women",
    "featured": false,
    "category": "women-trousers",
    "categoryName": "Trousers",
    "images": [
      {
        "url": "/media/products/trouser-1.jpg",
        "alt": "Pleat-Front Trouser — view 1"
      },
      {
        "url": "/media/products/trouser-1-detail.jpg",
        "alt": "Pleat-Front Trouser — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-ROS-XS",
        "size": "XS",
        "colorName": "Rosewood",
        "colorHex": "#b97b6e",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-INK-XS",
        "size": "XS",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-INK-S",
        "size": "S",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-ROS-S",
        "size": "S",
        "colorName": "Rosewood",
        "colorHex": "#b97b6e",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-ROS-M",
        "size": "M",
        "colorName": "Rosewood",
        "colorHex": "#b97b6e",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-INK-M",
        "size": "M",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-ROS-L",
        "size": "L",
        "colorName": "Rosewood",
        "colorHex": "#b97b6e",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-INK-L",
        "size": "L",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-INK-XL",
        "size": "XL",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 11
      },
      {
        "sku": "XV-PLEAT-FRONT-TROUSER-ROS-XL",
        "size": "XL",
        "colorName": "Rosewood",
        "colorHex": "#b97b6e",
        "stock": 11
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": true
  },
  {
    "id": "foundation-crew-tee",
    "name": "Foundation Crew Tee",
    "slug": "foundation-crew-tee",
    "description": "Our foundation tee is cut from 240 GSM organic cotton with a dense, dry hand that holds its shape. The neckline is ribbed and reinforced, the body is lightly tapered, and the shoulder seam sits exactly where it should.",
    "shortDescription": "A heavyweight organic cotton crew with a clean, structured drape.",
    "gender": "men",
    "pricePaise": 99000,
    "compareAtPricePaise": 129000,
    "material": "100% organic cotton, 240 GSM",
    "fit": "Regular fit, true to size",
    "pattern": "Solid",
    "care": "Machine wash cold. Line dry. Warm iron if needed.",
    "keywords": "white t-shirt cotton crew men basic",
    "featured": true,
    "category": "men-tshirts",
    "categoryName": "T-Shirts",
    "images": [
      {
        "url": "/media/products/men-1.jpg",
        "alt": "Foundation Crew Tee — view 1"
      },
      {
        "url": "/media/products/men-1-detail.jpg",
        "alt": "Foundation Crew Tee — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-FOUNDATION-CREW-TEE-INK-S",
        "size": "S",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 22
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-OPT-S",
        "size": "S",
        "colorName": "Optic White",
        "colorHex": "#f4f1ea",
        "stock": 20
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-INK-M",
        "size": "M",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 22
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-OPT-M",
        "size": "M",
        "colorName": "Optic White",
        "colorHex": "#f4f1ea",
        "stock": 22
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-OPT-L",
        "size": "L",
        "colorName": "Optic White",
        "colorHex": "#f4f1ea",
        "stock": 22
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-INK-L",
        "size": "L",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 22
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-INK-XL",
        "size": "XL",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 22
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-OPT-XL",
        "size": "XL",
        "colorName": "Optic White",
        "colorHex": "#f4f1ea",
        "stock": 22
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-INK-XXL",
        "size": "XXL",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 3
      },
      {
        "sku": "XV-FOUNDATION-CREW-TEE-OPT-XXL",
        "size": "XXL",
        "colorName": "Optic White",
        "colorHex": "#f4f1ea",
        "stock": 22
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "indigo-workshirt",
    "name": "Indigo Workshirt",
    "slug": "indigo-workshirt",
    "description": "Part shirt, part light jacket. Woven from a soft washed indigo cotton with a subtle slub, this workshirt has twin chest pockets and a straight hem that sits well untucked. It fades beautifully with wear.",
    "shortDescription": "A washed indigo overshirt with double chest pockets.",
    "gender": "men",
    "pricePaise": 249000,
    "compareAtPricePaise": 299000,
    "material": "100% cotton, garment washed",
    "fit": "Relaxed overshirt fit",
    "pattern": "Slub weave",
    "care": "Machine wash cold with like colours. Line dry.",
    "keywords": "denim shirt overshirt indigo men",
    "featured": true,
    "category": "men-shirts",
    "categoryName": "Shirts",
    "images": [
      {
        "url": "/media/products/men-2.jpg",
        "alt": "Indigo Workshirt — view 1"
      },
      {
        "url": "/media/products/men-2-detail.jpg",
        "alt": "Indigo Workshirt — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-INDIGO-WORKSHIRT-IND-S",
        "size": "S",
        "colorName": "Indigo",
        "colorHex": "#4b6079",
        "stock": 14
      },
      {
        "sku": "XV-INDIGO-WORKSHIRT-IND-M",
        "size": "M",
        "colorName": "Indigo",
        "colorHex": "#4b6079",
        "stock": 14
      },
      {
        "sku": "XV-INDIGO-WORKSHIRT-IND-L",
        "size": "L",
        "colorName": "Indigo",
        "colorHex": "#4b6079",
        "stock": 14
      },
      {
        "sku": "XV-INDIGO-WORKSHIRT-IND-XL",
        "size": "XL",
        "colorName": "Indigo",
        "colorHex": "#4b6079",
        "stock": 14
      },
      {
        "sku": "XV-INDIGO-WORKSHIRT-IND-XXL",
        "size": "XXL",
        "colorName": "Indigo",
        "colorHex": "#4b6079",
        "stock": 14
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "studio-76-tee",
    "name": "Studio 76 Tee",
    "slug": "studio-76-tee",
    "description": "A softer counterpart to the Foundation tee: 210 GSM cotton, a slightly boxier body and a small tonal Studio 76 print at the chest. Designed to be worn hard and washed often.",
    "shortDescription": "A midweight black tee with a small tonal studio mark.",
    "gender": "men",
    "pricePaise": 129000,
    "compareAtPricePaise": null,
    "material": "100% combed cotton, 210 GSM",
    "fit": "Boxy fit",
    "pattern": "Graphic",
    "care": "Machine wash cold inside out. Do not iron print.",
    "keywords": "black graphic tee men studio cotton",
    "featured": false,
    "category": "men-tshirts",
    "categoryName": "T-Shirts",
    "images": [
      {
        "url": "/media/products/men-3.jpg",
        "alt": "Studio 76 Tee — view 1"
      },
      {
        "url": "/media/products/men-7.jpg",
        "alt": "Studio 76 Tee — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-STUDIO-76-TEE-INK-S",
        "size": "S",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 18
      },
      {
        "sku": "XV-STUDIO-76-TEE-INK-M",
        "size": "M",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 18
      },
      {
        "sku": "XV-STUDIO-76-TEE-INK-L",
        "size": "L",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 18
      },
      {
        "sku": "XV-STUDIO-76-TEE-INK-XL",
        "size": "XL",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 18
      },
      {
        "sku": "XV-STUDIO-76-TEE-INK-XXL",
        "size": "XXL",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 18
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "rigid-straight-jean",
    "name": "Rigid Straight Jean",
    "slug": "rigid-straight-jean",
    "description": "Built from 13.5 oz rigid denim with a classic straight leg and a mid rise. The deep indigo starts clean and fades to your own pattern over time. Finished with a hidden coin pocket and a leather patch.",
    "shortDescription": "A mid-rise straight jean in rigid, deep-indigo denim.",
    "gender": "men",
    "pricePaise": 349000,
    "compareAtPricePaise": 429000,
    "material": "100% cotton denim, 13.5 oz",
    "fit": "Straight leg, mid rise",
    "pattern": "Rigid denim",
    "care": "Wash inside out, cold and sparingly. Hang dry.",
    "keywords": "jeans denim straight indigo men",
    "featured": true,
    "category": "men-jeans",
    "categoryName": "Jeans",
    "images": [
      {
        "url": "/media/products/men-4.jpg",
        "alt": "Rigid Straight Jean — view 1"
      },
      {
        "url": "/media/products/men-4-detail.jpg",
        "alt": "Rigid Straight Jean — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-RIGID-STRAIGHT-JEAN-DEE-28",
        "size": "28",
        "colorName": "Deep Indigo",
        "colorHex": "#293a50",
        "stock": 9
      },
      {
        "sku": "XV-RIGID-STRAIGHT-JEAN-DEE-30",
        "size": "30",
        "colorName": "Deep Indigo",
        "colorHex": "#293a50",
        "stock": 9
      },
      {
        "sku": "XV-RIGID-STRAIGHT-JEAN-DEE-32",
        "size": "32",
        "colorName": "Deep Indigo",
        "colorHex": "#293a50",
        "stock": 9
      },
      {
        "sku": "XV-RIGID-STRAIGHT-JEAN-DEE-34",
        "size": "34",
        "colorName": "Deep Indigo",
        "colorHex": "#293a50",
        "stock": 9
      },
      {
        "sku": "XV-RIGID-STRAIGHT-JEAN-DEE-36",
        "size": "36",
        "colorName": "Deep Indigo",
        "colorHex": "#293a50",
        "stock": 9
      },
      {
        "sku": "XV-RIGID-STRAIGHT-JEAN-DEE-38",
        "size": "38",
        "colorName": "Deep Indigo",
        "colorHex": "#293a50",
        "stock": 1
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "moto-leather-jacket",
    "name": "Moto Leather Jacket",
    "slug": "moto-leather-jacket",
    "description": "An uncluttered take on the classic moto: asymmetric zip, notched lapel and a slightly cropped body. Cut from soft vegetable-tanned lambskin that moulds to the wearer. A genuine investment piece.",
    "shortDescription": "A clean moto jacket in vegetable-tanned lambskin.",
    "gender": "men",
    "pricePaise": 1299000,
    "compareAtPricePaise": 1499000,
    "material": "100% lambskin leather, recycled polyester lining",
    "fit": "Slim moto fit",
    "pattern": "Solid",
    "care": "Leather specialist clean only. Condition annually.",
    "keywords": "leather jacket moto black men",
    "featured": false,
    "category": "men-outerwear",
    "categoryName": "Outerwear",
    "images": [
      {
        "url": "/media/products/men-5.jpg",
        "alt": "Moto Leather Jacket — view 1"
      },
      {
        "url": "/media/products/men-5-detail.jpg",
        "alt": "Moto Leather Jacket — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-MOTO-LEATHER-JACKET-BLA-S",
        "size": "S",
        "colorName": "Black",
        "colorHex": "#1a1917",
        "stock": 4
      },
      {
        "sku": "XV-MOTO-LEATHER-JACKET-BLA-M",
        "size": "M",
        "colorName": "Black",
        "colorHex": "#1a1917",
        "stock": 4
      },
      {
        "sku": "XV-MOTO-LEATHER-JACKET-BLA-L",
        "size": "L",
        "colorName": "Black",
        "colorHex": "#1a1917",
        "stock": 4
      },
      {
        "sku": "XV-MOTO-LEATHER-JACKET-BLA-XL",
        "size": "XL",
        "colorName": "Black",
        "colorHex": "#1a1917",
        "stock": 4
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "oxford-dress-shirt",
    "name": "Oxford Dress Shirt",
    "slug": "oxford-dress-shirt",
    "description": "A crisp white Oxford that doesn’t feel stiff. Woven from long-staple cotton with a gentle sheen, cut with a regular fit and a semi-cutaway collar that works with or without a tie.",
    "shortDescription": "A fine cotton Oxford with a softly structured collar.",
    "gender": "men",
    "pricePaise": 219000,
    "compareAtPricePaise": null,
    "material": "100% long-staple cotton Oxford",
    "fit": "Regular fit",
    "pattern": "Solid",
    "care": "Machine wash warm. Hang dry and press.",
    "keywords": "white shirt oxford formal men",
    "featured": false,
    "category": "men-shirts",
    "categoryName": "Shirts",
    "images": [
      {
        "url": "/media/products/men-6.jpg",
        "alt": "Oxford Dress Shirt — view 1"
      },
      {
        "url": "/media/products/men-6-detail.jpg",
        "alt": "Oxford Dress Shirt — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-OXFORD-DRESS-SHIRT-WHI-S",
        "size": "S",
        "colorName": "White",
        "colorHex": "#f7f5ef",
        "stock": 13
      },
      {
        "sku": "XV-OXFORD-DRESS-SHIRT-WHI-M",
        "size": "M",
        "colorName": "White",
        "colorHex": "#f7f5ef",
        "stock": 13
      },
      {
        "sku": "XV-OXFORD-DRESS-SHIRT-WHI-L",
        "size": "L",
        "colorName": "White",
        "colorHex": "#f7f5ef",
        "stock": 13
      },
      {
        "sku": "XV-OXFORD-DRESS-SHIRT-WHI-XL",
        "size": "XL",
        "colorName": "White",
        "colorHex": "#f7f5ef",
        "stock": 13
      },
      {
        "sku": "XV-OXFORD-DRESS-SHIRT-WHI-XXL",
        "size": "XXL",
        "colorName": "White",
        "colorHex": "#f7f5ef",
        "stock": 13
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "field-bomber",
    "name": "Field Bomber",
    "slug": "field-bomber",
    "description": "A seasonless layer in washed cotton twill, with a soft stand collar, two-way zip and comfortable ribbed trims. The tobacco tone is warm without being loud. Fully lined for easy layering.",
    "shortDescription": "A light tobacco bomber in washed cotton with a ribbed hem.",
    "gender": "men",
    "pricePaise": 599000,
    "compareAtPricePaise": 699000,
    "material": "98% cotton, 2% elastane; recycled polyester lining",
    "fit": "Regular bomber fit",
    "pattern": "Solid",
    "care": "Machine wash cold. Line dry. Do not tumble dry.",
    "keywords": "bomber jacket tan men outerwear",
    "featured": true,
    "category": "men-outerwear",
    "categoryName": "Outerwear",
    "images": [
      {
        "url": "/media/products/jacket-1.jpg",
        "alt": "Field Bomber — view 1"
      },
      {
        "url": "/media/products/jacket-1-detail.jpg",
        "alt": "Field Bomber — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-FIELD-BOMBER-TOB-S",
        "size": "S",
        "colorName": "Tobacco",
        "colorHex": "#9b6545",
        "stock": 8
      },
      {
        "sku": "XV-FIELD-BOMBER-TOB-M",
        "size": "M",
        "colorName": "Tobacco",
        "colorHex": "#9b6545",
        "stock": 2
      },
      {
        "sku": "XV-FIELD-BOMBER-TOB-L",
        "size": "L",
        "colorName": "Tobacco",
        "colorHex": "#9b6545",
        "stock": 8
      },
      {
        "sku": "XV-FIELD-BOMBER-TOB-XL",
        "size": "XL",
        "colorName": "Tobacco",
        "colorHex": "#9b6545",
        "stock": 8
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "overdye-hoodie",
    "name": "Overdye Hoodie",
    "slug": "overdye-hoodie",
    "description": "Built from 420 GSM loopback cotton and garment-dyed for a soft, lived-in tone from day one. The hood is double-layered, the cuffs hold their shape, and the body has just enough room to layer.",
    "shortDescription": "A heavyweight loopback hoodie with a garment-dyed finish.",
    "gender": "men",
    "pricePaise": 269000,
    "compareAtPricePaise": null,
    "material": "100% organic cotton loopback, 420 GSM",
    "fit": "Relaxed fit",
    "pattern": "Solid",
    "care": "Machine wash cold. Line dry. Colour may soften over time.",
    "keywords": "hoodie sweatshirt grey men cotton",
    "featured": true,
    "category": "men-sweatshirts",
    "categoryName": "Sweatshirts",
    "images": [
      {
        "url": "/media/products/knit-1.jpg",
        "alt": "Overdye Hoodie — view 1"
      },
      {
        "url": "/media/products/knit-1-detail.jpg",
        "alt": "Overdye Hoodie — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-OVERDYE-HOODIE-INK-S",
        "size": "S",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 12
      },
      {
        "sku": "XV-OVERDYE-HOODIE-FOG-S",
        "size": "S",
        "colorName": "Fog",
        "colorHex": "#9d9c97",
        "stock": 2
      },
      {
        "sku": "XV-OVERDYE-HOODIE-FOG-M",
        "size": "M",
        "colorName": "Fog",
        "colorHex": "#9d9c97",
        "stock": 12
      },
      {
        "sku": "XV-OVERDYE-HOODIE-INK-M",
        "size": "M",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 12
      },
      {
        "sku": "XV-OVERDYE-HOODIE-INK-L",
        "size": "L",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 12
      },
      {
        "sku": "XV-OVERDYE-HOODIE-FOG-L",
        "size": "L",
        "colorName": "Fog",
        "colorHex": "#9d9c97",
        "stock": 12
      },
      {
        "sku": "XV-OVERDYE-HOODIE-FOG-XL",
        "size": "XL",
        "colorName": "Fog",
        "colorHex": "#9d9c97",
        "stock": 12
      },
      {
        "sku": "XV-OVERDYE-HOODIE-INK-XL",
        "size": "XL",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 12
      },
      {
        "sku": "XV-OVERDYE-HOODIE-INK-XXL",
        "size": "XXL",
        "colorName": "Ink",
        "colorHex": "#17140f",
        "stock": 12
      },
      {
        "sku": "XV-OVERDYE-HOODIE-FOG-XXL",
        "size": "XXL",
        "colorName": "Fog",
        "colorHex": "#9d9c97",
        "stock": 12
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "loopback-sweatshirt",
    "name": "Loopback Sweatshirt",
    "slug": "loopback-sweatshirt",
    "description": "The quiet everyday sweatshirt: brushed loopback cotton, a clean ribbed neckline and a slightly cropped, boxy body. Cut to sit neatly over a tee without bulk.",
    "shortDescription": "A clean crew sweatshirt in ivory loopback cotton.",
    "gender": "men",
    "pricePaise": 229000,
    "compareAtPricePaise": null,
    "material": "100% organic cotton loopback, 380 GSM",
    "fit": "Boxy fit",
    "pattern": "Solid",
    "care": "Machine wash cold. Line dry.",
    "keywords": "sweatshirt ivory white crew men",
    "featured": false,
    "category": "men-sweatshirts",
    "categoryName": "Sweatshirts",
    "images": [
      {
        "url": "/media/products/knit-2.jpg",
        "alt": "Loopback Sweatshirt — view 1"
      },
      {
        "url": "/media/products/knit-2-detail.jpg",
        "alt": "Loopback Sweatshirt — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-LOOPBACK-SWEATSHIRT-CLO-S",
        "size": "S",
        "colorName": "Cloud",
        "colorHex": "#efeae0",
        "stock": 15
      },
      {
        "sku": "XV-LOOPBACK-SWEATSHIRT-CLO-M",
        "size": "M",
        "colorName": "Cloud",
        "colorHex": "#efeae0",
        "stock": 15
      },
      {
        "sku": "XV-LOOPBACK-SWEATSHIRT-CLO-L",
        "size": "L",
        "colorName": "Cloud",
        "colorHex": "#efeae0",
        "stock": 15
      },
      {
        "sku": "XV-LOOPBACK-SWEATSHIRT-CLO-XL",
        "size": "XL",
        "colorName": "Cloud",
        "colorHex": "#efeae0",
        "stock": 15
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  },
  {
    "id": "suede-rider-jacket",
    "name": "Suede Rider Jacket",
    "slug": "suede-rider-jacket",
    "description": "A rider jacket with the hardware pared back: a single zip, clean seams and a soft cognac suede that gains character with wear. Fully lined and built to be worn for years.",
    "shortDescription": "A soft suede rider in cognac, cut close and finished clean.",
    "gender": "men",
    "pricePaise": 1199000,
    "compareAtPricePaise": null,
    "material": "100% goat suede, viscose lining",
    "fit": "Slim rider fit",
    "pattern": "Solid",
    "care": "Professional leather clean only. Brush lightly.",
    "keywords": "suede jacket cognac men outerwear",
    "featured": false,
    "category": "men-outerwear",
    "categoryName": "Outerwear",
    "images": [
      {
        "url": "/media/products/women-4.jpg",
        "alt": "Suede Rider Jacket — view 1"
      },
      {
        "url": "/media/products/women-4-detail.jpg",
        "alt": "Suede Rider Jacket — view 2"
      }
    ],
    "variants": [
      {
        "sku": "XV-SUEDE-RIDER-JACKET-COG-M",
        "size": "M",
        "colorName": "Cognac",
        "colorHex": "#7b4f3a",
        "stock": 4
      },
      {
        "sku": "XV-SUEDE-RIDER-JACKET-COG-L",
        "size": "L",
        "colorName": "Cognac",
        "colorHex": "#7b4f3a",
        "stock": 5
      },
      {
        "sku": "XV-SUEDE-RIDER-JACKET-COG-XL",
        "size": "XL",
        "colorName": "Cognac",
        "colorHex": "#7b4f3a",
        "stock": 5
      }
    ],
    "status": "published",
    "sourcing": "own",
    "isNewArrival": false
  }
];
