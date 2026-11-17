import { HttpErrorResponse } from '@angular/common/http';

export const API_BASE_URL = '/api';

export interface CreateResult {
  insertId: number;
}

export interface ChangeResult {
  affectedRows: number;
}

export function refusalReason(error: unknown): string | undefined {
  if (!(error instanceof HttpErrorResponse) || error.status !== 400) {
    return undefined;
  }
  return error.error.error;
}
