import { Store } from '@tanstack/react-store';

type StoreState = {
  activeIssuedAlertIds: string[];
};

export const store = new Store<StoreState>({
  activeIssuedAlertIds: [],
});

export const updateActiveIssuedAlertIds = (ids: string[]) => {
  store.setState((state) => {
    return {
      ...state,
      activeIssuedAlertIds: ids,
    };
  });
};
