export type Intent = "product" | "service";

const PRODUCT_NOUNS =
  /\b(chair|chairs|armchair|armchairs|sofa|sofas|couch|desk|desks|table|tables|stool|stools|lamp|lamps|shelf|shelves|bookcase|dresser|bed|beds|mattress|rug|rugs|cabinet|bench|pomade|oil|spray|clipper|clippers)\b/i;

const SERVICE_TERMS =
  /\b(haircut|haircuts|hair|barber|barbers|barbershop|beard|trim|shave|salon|stylist|blowout|book|booking|appointment|massage|nail|nails|manicure|pedicure|clean|cleaning|plumber|plumbing)\b/i;

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

const PRICE_CONSTRAINT = /\b(?:under|below|less than|no more than|max(?:imum)?)\s*\$?\s*(\d{1,6})\b/i;

/** Returns the max price in **cents**, or null when the text sets no constraint. */
export function parsePriceConstraint(text: string): number | null {
  const m = PRICE_CONSTRAINT.exec(text ?? "");
  if (!m || m[1] === undefined) return null;
  const dollars = Number.parseInt(m[1], 10);
  return Number.isFinite(dollars) ? dollars * 100 : null;
}
