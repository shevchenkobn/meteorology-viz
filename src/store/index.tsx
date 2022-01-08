import { Action, createStore, Store, ThunkAction } from '@reduxjs/toolkit';
import { Context, createContext, FunctionComponent, useContext, useEffect, useMemo } from 'react';
import { createStoreHook, Provider, ReactReduxContextValue } from 'react-redux';
import { Observable, Subject } from 'rxjs';
import { Nullable } from '../lib/types';
import { DeepReadonlyReadState, saveState } from './lib';
import { AppAction, storeReducer } from './reducers';

export type AppStore = Store<DeepReadonlyReadState, AppAction>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, DeepReadonlyReadState, unknown, Action<string>>;

export function createAppStore(): AppStore {
  return createStore(storeReducer);
}

interface AppStateContextValue extends ReactReduxContextValue<DeepReadonlyReadState, AppAction> {
  state$: Observable<DeepReadonlyReadState>;
}
const context = createContext<AppStateContextValue>(null as any);

class StateSaver {
  private state: Nullable<DeepReadonlyReadState> = null;

  setState(state: DeepReadonlyReadState) {
    if (!this.state) {
      queueMicrotask(() => {
        if (!this.state) {
          return;
        }
        saveState(this.state);
        this.state = null;
      });
    }
    this.state = state;
  }
}

export const AppProvider: FunctionComponent<{ store: AppStore }> = ({ store, children }) => {
  const subject = useMemo(() => {
    const subject = new Subject<DeepReadonlyReadState>();
    const stateSaver = new StateSaver();
    store.subscribe(() => {
      const state = store.getState();
      stateSaver.setState(state);
      if (subject) {
        subject.next(state);
      } else {
        console.error('State subject is not initialized!');
      }
    });
    return subject;
  }, [store]);
  const store$ = useMemo(() => {
    return subject.asObservable();
  }, [subject]);
  useEffect(() => () => subject.complete(), [subject]);

  return (
    <Provider store={store} context={context as Context<any>}>
      <context.Provider
        value={{
          store: store as Store<DeepReadonlyReadState, AppAction>,
          state$: store$,
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
