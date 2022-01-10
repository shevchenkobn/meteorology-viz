import { Action, createStore, Store, ThunkAction } from '@reduxjs/toolkit';
import { Context, createContext, FunctionComponent, useContext, useEffect, useMemo } from 'react';
import { createStoreHook, Provider, ReactReduxContextValue } from 'react-redux';
import { Observable, Subject } from 'rxjs';
import { MacrotaskSingleton } from '../lib/dom';
import { DeepReadonlyRootState, saveState } from './lib';
import { AppAction, storeReducer } from './reducers';

export type AppStore = Store<DeepReadonlyRootState, AppAction>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, DeepReadonlyRootState, unknown, Action<string>>;

export function createAppStore(): AppStore {
  const store = createStore(storeReducer);
  // TODO: add unsubscribe logic.
  const stateSaver = new MacrotaskSingleton();
  const saveAsync = () => {
    const state = store.getState();
    stateSaver.setCallback(() => saveState(state));
  };
  store.subscribe(saveAsync);
  saveAsync();
  return store;
}

interface AppStateContextValue extends ReactReduxContextValue<DeepReadonlyRootState, AppAction> {
  state$: Observable<DeepReadonlyRootState>;
}
const context = createContext<AppStateContextValue>(null as any);

export const AppProvider: FunctionComponent<{ store: AppStore }> = ({ store, children }) => {
  const subject = useMemo(() => {
    const subject = new Subject<DeepReadonlyRootState>();
    store.subscribe(() => {
      const state = store.getState();
      if (subject) {
        subject.next(state);
      } else {
        console.error('State subject is not initialized!');
      }
    });
    return subject;
  }, [store]);
  const state$ = useMemo(() => {
    return subject.asObservable();
  }, [subject]);
  useEffect(() => () => subject.complete(), [subject]);

  return (
    <Provider store={store} context={context as Context<any>}>
      <context.Provider
        value={{
          store: store as Store<DeepReadonlyRootState, AppAction>,
          state$: state$,
          storeState: store.getState(),
        }}
      >
        {children}
      </context.Provider>
    </Provider>
  );
};

export const useAppStore = createStoreHook(context as any);

export function useRxAppStore() {
  const value = useContext<AppStateContextValue>(context);
  const { store, state$ } = value;
  return { store, state$ };
}
