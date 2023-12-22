export interface AsyncData<T> {
  isLoading: boolean;
  data: T | undefined;
}

const AsyncDataNone: AsyncData<any> = {
  isLoading: false,
  data: undefined,
};

const AsyncDataLoading: AsyncData<any> = {
  isLoading: true,
  data: undefined,
};

export { AsyncDataNone, AsyncDataLoading };
