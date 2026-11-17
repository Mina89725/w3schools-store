import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL, CreateResult } from '../api';
import { NewShipper } from './new-shipper';

@Service()
export class ShipperService {
  private readonly http = inject(HttpClient);

  createShipper(shipper: NewShipper): Observable<number> {
    return this.http
      .post<CreateResult>(`${API_BASE_URL}/shippers`, shipper)
      .pipe(map((result) => result.insertId));
  }
}
