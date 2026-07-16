const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats any date-like value as DD/MMM/YYYY (e.g. "14/Jul/2026") — the standard
 * date display format across this whole app. Use this instead of toLocaleDateString()
 * anywhere a date is shown to the user. */
export function formatDate(dateInput) {
  if (!dateInput) return "";
  const dateOnlyMatch = typeof dateInput === "string"
    ? /^(\d{4})-(\d{2})-(\d{2})/.exec(dateInput)
    : null;
  const d = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default formatDate;
