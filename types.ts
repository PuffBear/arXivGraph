
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  clusterId: number;
  arxivId: string;
  relevanceStatement: string; // Explains connection to search topic
  isBridge?: boolean;
}

export interface Link {
  source: string;
  target: string;
  type: 'citation' | 'similarity' | 'dataset';
}

export interface GraphData {
  nodes: Paper[];
  links: Link[];
}

export interface ClusterInsight {
  title: string;
  narrative: string;
}
