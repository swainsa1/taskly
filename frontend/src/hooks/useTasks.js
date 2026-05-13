import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, metaApi } from '../services/api';

export function useTasksQuery(filter = 'all') {
  return useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => tasksApi.list(filter),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ description, due_date, tag }) => tasksApi.create(description, due_date, tag),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksApi.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useReopenTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksApi.reopen(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => metaApi.tags().then(r => r.tags),
    staleTime: Infinity,
  });
}
