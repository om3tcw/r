const TIME_ZONE_CODE_LOCALES = ["en-GB", "en-US", "ja-JP"];

function readShortTimeZoneName(timeZone, date, locale) {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find((part) => part.type === "timeZoneName")?.value || "";
}

export function getTimeZoneCode(timeZone, date = new Date()) {
  let offsetFallback = "";

  for (const locale of TIME_ZONE_CODE_LOCALES) {
    try {
      const shortName = readShortTimeZoneName(timeZone, date, locale);
      if (/^[A-Z]{2,6}$/.test(shortName)) {
        return shortName;
      }

      if (!offsetFallback && shortName) {
        offsetFallback = shortName;
      }
    } catch (error) {
      return "";
    }
  }

  return offsetFallback;
}

export function formatTimeZoneOptionLabel(timeZone, date = new Date()) {
  const code = getTimeZoneCode(timeZone, date);
  return code ? `${code} — ${timeZone}` : timeZone;
}
