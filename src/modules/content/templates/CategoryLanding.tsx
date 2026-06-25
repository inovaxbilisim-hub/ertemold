import Link from 'next/link';
import { ArrowLeft, LucideIcon } from 'lucide-react';

interface CategoryLandingProps {
  backLabel: string;
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  titleSuffix: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  headerClassName: string;
  badgeClassName: string;
  accentClassName: string;
}

export default function CategoryLanding({
  backLabel,
  badge,
  titlePrefix,
  titleAccent,
  titleSuffix,
  description,
  icon: Icon,
  iconClassName,
  headerClassName,
  badgeClassName,
  accentClassName,
}: CategoryLandingProps) {
  return (
    <div className="category-header">
      <div className={headerClassName} />
      <div className="category-header-content">
        <Link href="/" className="back-link">
          <ArrowLeft size={14} /> {backLabel}
        </Link>
        <div className={badgeClassName}>
          <Icon size={14} className={iconClassName} />
          <span>{badge}</span>
        </div>
        <h1 className="category-title">
          {titlePrefix}{' '}
          <span className={accentClassName}>{titleAccent}</span>
          {titleSuffix ? <> {titleSuffix}</> : null}
        </h1>
        <p className="category-description">{description}</p>
      </div>
    </div>
  );
}
