import Link from "next/link";
import { ArrowIcon } from "./Icons";

export function NextStop({ eyebrow, title, description, href, label }: { eyebrow: string; title: string; description: string; href: string; label: string }) {
  return <section className="next-stop"><div><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></div><Link href={href}>{label} <ArrowIcon /></Link></section>;
}
