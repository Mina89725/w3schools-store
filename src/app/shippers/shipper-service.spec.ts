import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { NewShipper } from './new-shipper';
import { ShipperService } from './shipper-service';

const speedyMail: NewShipper = { ShipperName: 'Speedy Mail', Phone: '031 555 12 34' };

describe('ShipperService', () => {
  it('saves a shipper with POST /api/shippers and returns its new ID', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(ShipperService);
    const api = TestBed.inject(HttpTestingController);

    const newId = firstValueFrom(service.createShipper(speedyMail));
    const request = api.expectOne('/api/shippers');
    request.flush({ affectedRows: 1, insertId: 4 });

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(speedyMail);
    expect(await newId).toBe(4);
  });
});
