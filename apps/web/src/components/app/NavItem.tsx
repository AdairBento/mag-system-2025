import Link from "next/link";

type NavItemProps = {
  href: string;
  label: string;
  active?: boolean;
};

export function NavItem({ href, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
        active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
      ].join(" ")}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-60" />
      <span>{label}</span>
    </Link>
  );
}
