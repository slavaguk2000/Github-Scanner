import { RepositoryVisibility } from '../types/repositoryTypes';

export interface RepositoryTreeNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree' | string;
  sha: string;
  size: number;
  url: string;
}

export interface RepositoryRawWebhook {
  type: string;
  id: number;
  name: string;
  active: boolean;
  events: string[];
  config: {
    content_type: string;
    insecure_ssl: string;
    url: string;
  };
  updated_at: string;
  created_at: string;
  url: string;
  test_url: string;
  ping_url: string;
  deliveries_url: string;
  last_response: {
    code?: unknown;
    status: string;
    message?: string;
  };
}

export interface RepositoryWebhook {
  id: number;
  name: string;
  active: boolean;
  updatedAt: string;
  createdAt: string;
  url: string;
  testUrl: string;
  pingUrl: string;
  deliveriesUrl: string;
}

export interface RepositoryTreeFileSummary extends RepositoryTreeNode {
  type: 'blob' | string;
}

export interface RepositoryFileData {
  sha: string;
  node_id: string;
  size: number;
  url: string;
  content: string;
  encoding: string;
}

export interface RepositoryTreeRawData {
  sha: string;
  url: string;
  tree: Array<RepositoryTreeNode>;
  truncated: boolean;
}

export interface RepositoryIdentification {
  name: string;
  owner: string;
}

export interface RepositoryRawData {
  name: string;
  owner: {
    id: number;
    login: string;
    avatar_url?: string;
    url?: string;
  };
  size: number;
}

export interface RepositoryData {
  name: string;
  owner: {
    id: number;
    login: string;
    avatarUrl?: string;
    url?: string;
  };
  size: number;
}

export interface RepositoryDetailedRawData extends RepositoryRawData {
  visibility: string;
  default_branch: string;
}

export interface RepositoryDetailedData extends RepositoryData {
  visibility: RepositoryVisibility;
  filesNumber: number;
  ymlContent?: string;
  activeWebhooks: Array<RepositoryWebhook>;
}
