# XEVORAS — Design Override: Admin & Reselling Manager
**Page Routes:** `/admin` & `/admin/reselling`
**Focus:** High-Density Data UX · Financial Margin Visualizer · Supplier Workflow

## Admin Overview (`/admin`)
- Dark Charcoal background (`#141414`) with elevated card panels (`#1C1C1C`).
- Key Performance Metrics: Gross Revenue, Total Orders, Average Order Value (AOV), Profit Margin, Inventory Warnings.
- Responsive tabular views with horizontal scroll preservation for mobile.
- Modal order drawer for updating status, shipment tracking, and customer contact notes.

## Meesho Reselling Manager (`/admin/reselling`)
- Sourcing Economics Panel:
  - Real-time Gross Margin calculator: Retail Price vs Supplier Cost vs Logistics.
  - Color-coded margin health pills (Green: >35%, Amber: 20-35%, Red: <20%).
- Compliant Supplier Ingestion Desk:
  - Manual product form with external supplier URL, SKU, wholesale cost, and image validation.
  - CSV/Excel batch upload with schema checking and duplicate SKU detection.
- Supplier Fulfilment Pipeline:
  - Strict progression tracker: `To Source` → `Purchased` → `Supplier Shipped` → `Delivered`.
