import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { gameService } from '../../services';

export function useGameActions() {
  const { mutate: start } = useMutation({
    mutationFn: () => gameService.start(),
    onError: (e: AxiosError) => console.error(e),
  });

  const { mutate: end } = useMutation({
    mutationFn: (payload) => gameService.end(payload),
    onError: (e: AxiosError) => console.error(e),
  });

  return {
    start,
    end,
  }
}
