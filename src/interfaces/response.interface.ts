export interface Response<T = void> {
  message: string;
  payload: T;
  errors?: string[];
}
