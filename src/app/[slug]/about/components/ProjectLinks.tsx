import { ProjectLink } from "@/lib/projectLinks";

interface Props {
  links: ProjectLink[];
}

export function ProjectLinks(props: Props) {
  const { links } = props;
  return (
    <ul className="flex gap-2.5 flex-wrap">
      {links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:decoration-teal-500 underline-offset-4"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
