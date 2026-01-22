import { Store } from '@tanstack/react-store';

type StoreState = {
  activeAlertReference?: {
    alertIds: string[];
    date: string;
  };
  activeOutlookReference?: {
    date: string;
    quotes: string[];
    keywords: string[];
  };
};

export const store = new Store<StoreState>({});

export const setActiveAlertReference = (
  activeAlertReference: StoreState['activeAlertReference'],
) => {
  store.setState((state) => {
    return {
      ...state,
      activeAlertReference,
    };
  });
};

export const setActiveOutlookReference = (
  activeOutlookReference: StoreState['activeOutlookReference'],
) => {
  store.setState((state) => {
    return {
      ...state,
      activeOutlookReference,
    };
  });
};

export const removeActiveAlertReference = () => {
  store.setState((state) => {
    return {
      ...state,
      activeAlertReference: undefined,
    };
  });
};

export const removeActiveOutlookReference = () => {
  store.setState((state) => {
    return {
      ...state,
      activeOutlookReference: undefined,
    };
  });
};
