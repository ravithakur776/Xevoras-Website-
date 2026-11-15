import { MarginAnalysis } from '../types';

export class MarginService {
  /**
   * Calculates gross margin and economics for reselling/supplier products
   * @param sellingPricePaise Customer purchase price in paise (e.g. ₹1,290 = 129000)
   * @param supplierCostPaise Sourced wholesale cost in paise (e.g. ₹450 = 45000)
   * @param shippingPaise Logistics expense (default: ₹70 = 7000)
   * @param packagingPaise Packaging & tags (default: ₹30 = 3000)
   * @param platformFeePaise Payment gateway/platform fee (e.g. 2% ~ ₹26 = 2580)
   */
  public static calculateMargin(
    sellingPricePaise: number,
    supplierCostPaise: number,
    shippingPaise: number = 7000,
    packagingPaise: number = 3000,
    platformFeePaise: number = 0
  ): MarginAnalysis {
    // Platform fee defaults to 2% of selling price if not explicitly passed
    const effectiveFee = platformFeePaise > 0 ? platformFeePaise : Math.round(sellingPricePaise * 0.02);
    const totalCostPaise = supplierCostPaise + shippingPaise + packagingPaise + effectiveFee;
    const grossMarginPaise = sellingPricePaise - totalCostPaise;
    
    const grossMarginPercentage = sellingPricePaise > 0
      ? Number(((grossMarginPaise / sellingPricePaise) * 100).toFixed(1))
      : 0;

    let healthTier: 'optimal' | 'moderate' | 'critical' = 'critical';
    if (grossMarginPercentage >= 35) {
      healthTier = 'optimal';
    } else if (grossMarginPercentage >= 20) {
      healthTier = 'moderate';
    }

    return {
      sellingPricePaise,
      supplierCostPaise,
      shippingPaise,
      packagingPaise,
      platformFeePaise: effectiveFee,
      totalCostPaise,
      grossMarginPaise,
      grossMarginPercentage,
      healthTier,
    };
  }

  /**
   * Evaluates batch products from CSV input with duplicate SKU detection
   */
  public static validateCsvRow(row: Record<string, string>, existingSkus: Set<string>) {
    const errors: string[] = [];
    const sku = (row['Supplier SKU'] || row['sku'] || '').trim();
    const name = (row['Product Name'] || row['name'] || '').trim();
    const cost = parseFloat(row['Supplier Cost'] || row['cost'] || '0');
    const price = parseFloat(row['Selling Price'] || row['price'] || '0');

    if (!sku) errors.push('Missing Supplier SKU');
    if (existingSkus.has(sku)) errors.push(`Duplicate SKU: ${sku}`);
    if (!name) errors.push('Missing Product Name');
    if (cost <= 0) errors.push('Invalid Supplier Cost');
    if (price <= cost) errors.push('Selling price must exceed supplier cost');

    return {
      valid: errors.length === 0,
      errors,
      sku,
      name,
      supplierCostPaise: Math.round(cost * 100),
      sellingPricePaise: Math.round(price * 100),
    };
  }
}
