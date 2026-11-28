export interface NfeImportItemError {
  nItem: string;
  name: string;
  message: string;
}

export interface NfeImportResult {
  emitter: string | null;
  total: number;
  created: number;
  restocked: number;
  errors: NfeImportItemError[];
}
