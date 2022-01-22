import { useCallback, useState } from 'react';

export const useRerender = () => {
  const setRerenderTriggerState = useState(0)[1];
  return useCallback(
    () => setRerenderTriggerState((c) => c + 1),
    [setRerenderTriggerState]
  );
}