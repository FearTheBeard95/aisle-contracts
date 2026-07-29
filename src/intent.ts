export type Intent = "product" | "service";

const PRODUCT_NOUNS =
  /\b(chair|chairs|armchair|armchairs|sofa|sofas|couch|desk|desks|table|tables|stool|stools|lamp|lamps|shelf|shelves|bookcase|dresser|bed|beds|mattress|rug|rugs|cabinet|bench|pomade|oil|spray|clipper|clippers)\b/i;

const SERVICE_TERMS =
  /\b(haircut|haircuts|hair|barber|barbers|barbershop|hairdresser|hairdressers|beard|trim|shave|salon|stylist|blowout|book|booking|appointment|massage|nail|nails|manicure|pedicure|clean|cleaning|plumber|plumbing)\b/i;

/**
 * PRD §7: product nouns are evaluated before service verbs, and service terms
 * match on word boundaries. "chair" must never classify as "hair".
 */
export function classifyIntent(text: string): Intent {
  const t = text ?? "";
  if (PRODUCT_NOUNS.test(t)) return "product";
  if (SERVICE_TERMS.test(t)) return "service";
  return "product";
}

const PRICE_CONSTRAINT = /\b(?:under|below|less than|no more than|max(?:imum)?)\s*\$?\s*((?:\d{1,7}|\d{1,3},\d{3}|\d,\d{3},\d{3})(?:\.\d+)?(?![,\d]))\b/i;

/** Returns the max price in **cents**, or null when the text sets no constraint. */
export function parsePriceConstraint(text: string): number | null {
  const m = PRICE_CONSTRAINT.exec(text ?? "");
  if (!m || m[1] === undefined) return null;

  // Remove thousands separators
  const priceStr = m[1].replace(/,/g, "");
  const parts = priceStr.split(".");
  const dollarPart = parts[0];
  const centPart = parts[1];

  if (dollarPart === undefined) return null;
  const dollars = Number.parseInt(dollarPart, 10);
  if (!Number.isFinite(dollars)) return null;

  let cents = dollars * 100;

  if (centPart !== undefined) {
    // Handle fractional part and round to nearest cent
    let fractionalCents = Number.parseInt(centPart.padEnd(2, "0").slice(0, 2), 10);

    // Round half-up if more than 2 decimal places
    if (centPart.length > 2) {
      const thirdDigit = centPart[2];
      if (thirdDigit !== undefined) {
        const thirdDecimal = Number.parseInt(thirdDigit, 10);
        if (thirdDecimal >= 5) {
          if (fractionalCents >= 99) {
            cents += 100; // Round up to next dollar
            fractionalCents = 0;
          } else {
            fractionalCents += 1;
          }
        }
      }
    }

    cents += fractionalCents;
  }

  return cents;
}
