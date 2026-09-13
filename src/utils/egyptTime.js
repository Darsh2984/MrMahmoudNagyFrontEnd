export const EGYPT_TIME_ZONE = "Africa/Cairo";

const cairoPartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: EGYPT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getCairoParts(date) {
  const parts = cairoPartsFormatter.formatToParts(date);
  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  });

  return values;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

/** Convert an absolute timestamp to the wall-clock value shown in Egypt. */
export function isoToCairoInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = getCairoParts(date);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

/**
 * Convert an Egypt wall-clock value to UTC. The offset is looked up for the
 * selected date, so Egypt's GMT+2/GMT+3 daylight-saving changes are respected.
 */
export function cairoInputValueToIso(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(
    String(value || ""),
  );

  if (!match) return "";

  const desiredWallTime = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    0,
    0,
  );

  let utcTime = desiredWallTime;

  // Two passes also handle dates close to a daylight-saving transition.
  for (let pass = 0; pass < 3; pass += 1) {
    const parts = getCairoParts(new Date(utcTime));
    const representedWallTime = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second || 0,
    );

    const difference = desiredWallTime - representedWallTime;
    utcTime += difference;

    if (difference === 0) break;
  }

  return new Date(utcTime).toISOString();
}

export function formatEgyptDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: EGYPT_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

