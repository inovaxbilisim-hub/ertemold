export interface BlockTypeDefinition {
  typeKey: string;
  componentPath?: string;
  defaultProps?: Record<string, any>;
  category: 'content' | 'interactive' | 'seo' | 'visual';
  renderer?: React.ComponentType<BlockProps>;
  active: boolean;
}

export interface BlockProps {
  block: {
    id?: string;
    type: string;
    data: Record<string, any>;
  };
  index: number;
  settings?: any;
  locationName?: string;
  serviceName?: string;
  servicesData?: any[];
  referencesData?: any[];
  statsData?: any[];
  heroData?: any;
  sectionContentData?: any;
  branchesData?: any[];
  categoriesData?: any[];
  allPagesData?: any[];
}

export interface VisualElementType {
  typeKey: string;
  componentPath: string;
  defaultData?: Record<string, any>;
  active: boolean;
}

export interface BlockTypeRegistration {
  typeKey: string;
  componentPath: string;
  defaultProps?: Record<string, any>;
  category: 'content' | 'interactive' | 'seo' | 'visual';
  active: boolean;
}