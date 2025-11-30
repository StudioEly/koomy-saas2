import type { User, Community, Plan, UserCommunityMembership, NewsArticle, Event, SupportTicket, FAQ, Message } from "@shared/schema";

const API_BASE = "/api";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  // Authentication
  auth: {
    login: (email: string, password: string) =>
      fetchApi<{ user: Omit<User, "password">; memberships: UserCommunityMembership[] }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },

  // Communities
  communities: {
    getAll: () => fetchApi<Community[]>("/communities"),
    getById: (id: string) => fetchApi<Community>(`/communities/${id}`),
    create: (data: Partial<Community>) =>
      fetchApi<Community>("/communities", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Plans
  plans: {
    getAll: () => fetchApi<Plan[]>("/plans"),
  },

  // Users
  users: {
    getById: (id: string) => fetchApi<Omit<User, "password">>(`/users/${id}`),
    create: (data: Partial<User>) =>
      fetchApi<Omit<User, "password">>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Memberships
  memberships: {
    getUserMemberships: (userId: string) =>
      fetchApi<UserCommunityMembership[]>(`/users/${userId}/memberships`),
    getCommunityMembers: (communityId: string) =>
      fetchApi<(UserCommunityMembership & { user: Omit<User, "password"> })[]>(
        `/communities/${communityId}/members`
      ),
    create: (data: Partial<UserCommunityMembership>) =>
      fetchApi<UserCommunityMembership>("/memberships", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<UserCommunityMembership>) =>
      fetchApi<UserCommunityMembership>(`/memberships/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // News
  news: {
    getCommunityNews: (communityId: string) =>
      fetchApi<NewsArticle[]>(`/communities/${communityId}/news`),
    getById: (id: string) => fetchApi<NewsArticle>(`/news/${id}`),
    create: (data: Partial<NewsArticle>) =>
      fetchApi<NewsArticle>("/news", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<NewsArticle>) =>
      fetchApi<NewsArticle>(`/news/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Events
  events: {
    getCommunityEvents: (communityId: string) =>
      fetchApi<Event[]>(`/communities/${communityId}/events`),
    getById: (id: string) => fetchApi<Event>(`/events/${id}`),
    create: (data: Partial<Event>) =>
      fetchApi<Event>("/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Event>) =>
      fetchApi<Event>(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Support Tickets
  tickets: {
    getAll: () => fetchApi<SupportTicket[]>("/tickets"),
    getUserTickets: (userId: string) =>
      fetchApi<SupportTicket[]>(`/users/${userId}/tickets`),
    getCommunityTickets: (communityId: string) =>
      fetchApi<SupportTicket[]>(`/communities/${communityId}/tickets`),
    create: (data: Partial<SupportTicket>) =>
      fetchApi<SupportTicket>("/tickets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<SupportTicket>) =>
      fetchApi<SupportTicket>(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // FAQs
  faqs: {
    getAll: () => fetchApi<FAQ[]>("/faqs"),
    getByRole: (role: string) => fetchApi<FAQ[]>(`/faqs?role=${role}`),
  },

  // Messages
  messages: {
    getCommunityMessages: (communityId: string, conversationId: string) =>
      fetchApi<Message[]>(`/communities/${communityId}/messages/${conversationId}`),
    create: (data: Partial<Message>) =>
      fetchApi<Message>("/messages", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    markRead: (id: string) =>
      fetchApi<{ success: boolean }>(`/messages/${id}/read`, {
        method: "PATCH",
      }),
  },
};
