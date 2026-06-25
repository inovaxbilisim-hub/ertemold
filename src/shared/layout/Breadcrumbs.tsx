import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
  siteUrl?: string;
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-nav">
      <ol itemScope itemType="https://schema.org/BreadcrumbList" className="flex items-center gap-2 m-0 p-0 list-none">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center">
          <Link itemProp="item" href="/" className="breadcrumb-link home-link flex items-center gap-1">
            <Home size={14} />
            <span itemProp="name">Ana Sayfa</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        
        {crumbs.map((crumb, i) => (
          <li key={i} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center">
            <span className="breadcrumb-item flex items-center">
              <ChevronRight size={14} className="breadcrumb-separator mx-1 opacity-50" />
              {crumb.href ? (
                <Link itemProp="item" href={crumb.href} className="breadcrumb-link">
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : (
                <span itemProp="name" className="breadcrumb-current text-opacity-80">
                  {crumb.label}
                </span>
              )}
            </span>
            <meta itemProp="position" content={`${i + 2}`} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
