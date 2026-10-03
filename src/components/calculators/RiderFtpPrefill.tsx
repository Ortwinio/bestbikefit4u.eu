import { riderFtpMessages } from "@/i18n/account/riderFtp";

export type RiderFtpProfile = {
  ftpWatts?: number;
  ftpMethod?: string;
  ftpMeasuredAt?: number;
};

export function getRiderFtp(profile?: RiderFtpProfile | null) {
  const watts = profile?.ftpWatts;
  if (watts === undefined || !Number.isFinite(watts) || watts < 80 || watts > 500) return null;
  return { watts, measuredAt: profile?.ftpMeasuredAt };
}

export function RiderFtpPrefill({ ftp, locale }: {
  ftp: NonNullable<ReturnType<typeof getRiderFtp>>;
  locale: "nl" | "en";
}) {
  const copy = riderFtpMessages[locale];
  const date = ftp.measuredAt === undefined ? null : new Date(ftp.measuredAt);
  const validDate = date !== null && Number.isFinite(date.getTime());
  return <p className="text-sm text-muted-foreground">
    {copy.fromProfile}: {ftp.watts} W · {validDate ? <>
      {copy.recorded} <time dateTime={date.toISOString()}>
        {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(date)}
      </time>
    </> : copy.unknownDate}
  </p>;
}
