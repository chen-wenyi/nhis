import { Store } from '@tanstack/react-store';

type StoreState = {
  activeReference?: {
    alertIds: string[];
    outlookDate: string;
  };
};

export const store = new Store<StoreState>({});

export const setActiveReference = (
  activeReference: StoreState['activeReference'],
) => {
  store.setState((state) => {
    return {
      ...state,
      activeReference,
    };
  });
};

export const removeActiveReference = () => {
  store.setState((state) => {
    return {
      ...state,
      activeReference: undefined,
    };
  });
};
