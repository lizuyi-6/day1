import { get, post, put, del, uploadFile } from '@/utils/api';
import { API_BASE_URL } from '@/config/api';

export interface DocumentGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  chunkCount: number;
}

export interface Document {
  fileName: string;
  chunkCount: number;
  firstChunkId: string;
  uploadedAt: string;
  groupId?: string;
}

export interface SearchResult {
  id: string;
  fileName: string;
  content: string;
  createdAt: string;
  groupId?: string;
}

class KnowledgeService {
  async getGroups(): Promise<DocumentGroup[]> {
    const response = await get(`${API_BASE_URL}/knowledge/groups`);
    return response.data || [];
  }

  async getGroup(id: string): Promise<DocumentGroup> {
    const response = await get(`${API_BASE_URL}/knowledge/groups/${id}`);
    return response.data;
  }

  async createGroup(name: string, description?: string): Promise<DocumentGroup> {
    const response = await post(`${API_BASE_URL}/knowledge/groups`, { name, description });
    return response.data;
  }

  async updateGroup(id: string, name?: string, description?: string): Promise<DocumentGroup> {
    const response = await put(`${API_BASE_URL}/knowledge/groups/${id}`, { name, description });
    return response.data;
  }

  async deleteGroup(id: string): Promise<void> {
    await del(`${API_BASE_URL}/knowledge/groups/${id}`);
  }

  async getDocuments(groupId?: string, page: number = 1, limit: number = 20): Promise<{
    items: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const url = groupId
      ? `${API_BASE_URL}/knowledge/groups/${groupId}/documents?page=${page}&limit=${limit}`
      : `${API_BASE_URL}/knowledge/documents?page=${page}&limit=${limit}`;
    const response = await get(url);
    return response.data;
  }

  async uploadDocument(file: File, groupId?: string): Promise<any> {
    const url = groupId
      ? `${API_BASE_URL}/knowledge/upload?groupId=${groupId}`
      : `${API_BASE_URL}/knowledge/upload`;
    return uploadFile(url, file);
  }

  async deleteDocument(fileName: string, groupId?: string): Promise<void> {
    const url = groupId
      ? `${API_BASE_URL}/knowledge/documents/${encodeURIComponent(fileName)}?groupId=${groupId}`
      : `${API_BASE_URL}/knowledge/documents/${encodeURIComponent(fileName)}`;
    await del(url);
  }

  async search(query: string, groupId?: string, topK: number = 3): Promise<SearchResult[]> {
    let url = `${API_BASE_URL}/knowledge/search?q=${encodeURIComponent(query)}&topK=${topK}`;
    if (groupId) {
      url += `&groupId=${groupId}`;
    }
    const response = await get(url);
    return response.data || [];
  }
}

export const knowledgeService = new KnowledgeService();
