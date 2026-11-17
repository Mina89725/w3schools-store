import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { Product } from './product';
import { ProductService } from './product-service';

const chais: Product = {
  ProductID: 1,
  ProductName: 'Chais',
  SupplierID: 1,
  CategoryID: 1,
  Unit: '10 boxes x 20 bags',
  Price: 18,
};

describe('ProductService', () => {
  it('loads all products from GET /api/products', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(ProductService);
    const api = TestBed.inject(HttpTestingController);

    const products = firstValueFrom(service.getProducts());
    const request = api.expectOne('/api/products');
    request.flush([chais]);

    expect(request.request.method).toBe('GET');
    expect(await products).toEqual([chais]);
  });
});
