export function commaNumber(value: string | number): string {
  const numStr = value.toString();
  const parts = numStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function prettyNumber(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  if (num >= 1e9) {
    return (num / 1e9).toFixed().replace(/\.00$/, "") + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed().replace(/\.00$/, "") + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed().replace(/\.00$/, "") + "k";
  } else {
    return num.toFixed(2).replace(/\.00$/, "");
  }
}
