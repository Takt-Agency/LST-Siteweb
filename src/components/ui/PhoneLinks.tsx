import { Fragment } from "react";
import { contact } from "@/data/site";
import { cn, telHref } from "@/lib/utils";

/** All LST phone numbers as `tel:` links, inline ("A / B") or stacked one per line. */
export function PhoneLinks({ linkClassName, stacked }: { linkClassName?: string; stacked?: boolean }) {
  return (
    <>
      {contact.phones.map((phone, i) => (
        <Fragment key={phone}>
          {i > 0 && !stacked && <span aria-hidden className="mx-1.5 opacity-50">/</span>}
          <a href={telHref(phone)} className={cn("whitespace-nowrap", stacked && "block", linkClassName)}>
            {phone}
          </a>
        </Fragment>
      ))}
    </>
  );
}
