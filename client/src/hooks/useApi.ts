import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Auth hooks
export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.login(email, password),
  });
}

// Communities hooks
export function useCommunities() {
  return useQuery({
    queryKey: ["communities"],
    queryFn: api.communities.getAll,
  });
}

export function useCommunity(id: string) {
  return useQuery({
    queryKey: ["communities", id],
    queryFn: () => api.communities.getById(id),
    enabled: !!id,
  });
}

// Plans hooks
export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: api.plans.getAll,
  });
}

// Members hooks
export function useCommunityMembers(communityId: string) {
  return useQuery({
    queryKey: ["members", communityId],
    queryFn: () => api.memberships.getCommunityMembers(communityId),
    enabled: !!communityId,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.memberships.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useUpdateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.memberships.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

// News hooks
export function useCommunityNews(communityId: string) {
  return useQuery({
    queryKey: ["news", communityId],
    queryFn: () => api.news.getCommunityNews(communityId),
    enabled: !!communityId,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.news.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

// Events hooks
export function useCommunityEvents(communityId: string) {
  return useQuery({
    queryKey: ["events", communityId],
    queryFn: () => api.events.getCommunityEvents(communityId),
    enabled: !!communityId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.events.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// Tickets hooks
export function useAllTickets() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: api.tickets.getAll,
  });
}

export function useUserTickets(userId: string) {
  return useQuery({
    queryKey: ["tickets", "user", userId],
    queryFn: () => api.tickets.getUserTickets(userId),
    enabled: !!userId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.tickets.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

// FAQs hooks
export function useFAQs(role?: string) {
  return useQuery({
    queryKey: ["faqs", role],
    queryFn: () => (role ? api.faqs.getByRole(role) : api.faqs.getAll()),
  });
}
