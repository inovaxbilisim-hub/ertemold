export interface Block {
  id?: string;
  type: string;
  data: Record<string, any>;
}

export interface BlockRendererProps {
  blocks: Block[];
  servicesData?: any[];
  referencesData?: any[];
  statsData?: any[];
  heroData?: any;
  sectionContentData?: any;
  branchesData?: any[];
  categoriesData?: any[];
  sectionContent?: any;
  allPagesData?: any[];
  depth?: number;
  renderedPageIds?: string[];
  settings?: any;
  locationName?: string;
  serviceName?: string;
}

export interface BlockComponentProps extends BlockRendererProps {
  block: Block;
  index: number;
}

export interface BlockTypeDefinition {
  typeKey: string;
  componentPath?: string;
  defaultProps?: Record<string, any>;
  category: 'content' | 'interactive' | 'seo' | 'visual';
  active: boolean;
}

export interface BlockTypeRegistration {
  typeKey: string;
  componentPath: string;
  defaultProps?: Record<string, any>;
  category: 'content' | 'interactive' | 'seo' | 'visual';
  active: boolean;
}
