import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductService } from '../product-service';

@Component({
  imports: [DecimalPipe],
  selector: 'app-product-list',
  styleUrl: './product-list.css',
  templateUrl: './product-list.html',
})
export class ProductList {
  private readonly productService = inject(ProductService);

  protected readonly products = rxResource({
    stream: () => this.productService.getProducts(),
  });
}
