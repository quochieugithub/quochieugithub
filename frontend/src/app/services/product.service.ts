import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ProductInfo} from '../models/productInfo';
import {apiUrl} from '../../environments/environment';
import {Category} from '../models/Category';
import {ToastrService} from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private productUrl = `${apiUrl}/product`;
    private categoryUrl = `${apiUrl}/category`;
  private baseurl = 'http://localhost:8080/api/delete/product';
  private productUrl1 = `${apiUrl}/product/under25`;
  private productUrl2 = `${apiUrl}/product/from25to50`;
  private productUrl3 = `${apiUrl}/product/from50to100`;
  private productUrl4 = `${apiUrl}/product/from100to200`;
  private productUrl5 = `${apiUrl}/product/above200`;

    constructor(private http: HttpClient,
                private toastr: ToastrService,) {

    }

    getAllInPage(page: number, size: number): Observable<any> {
        const url = `${this.productUrl}?page=${page}&size=${size}`;
        return this.http.get(url)
            .pipe(
                // tap(_ => console.log(_)),
            )
    }

  createProduct1(product: ProductInfo): Observable<any> {
    return this.http.post<any>(`${apiUrl}/seller/product/new`, product);
  }

    getCategoryInPage(categoryType: number, page: number, size: number): Observable<any> {
        const url = `${this.categoryUrl}/${categoryType}?page=${page}&size=${size}`;
        return this.http.get(url).pipe(
            // tap(data => console.log(data))
        );
    }
  getunder25(page = 1, size = 10): Observable<any> {
    return this.http.get(`${this.productUrl1}?page=${page}&size=${size}`).pipe();
  }
  getfrom25to50(page = 1, size = 10): Observable<any> {
    return this.http.get(`${this.productUrl2}?page=${page}&size=${size}`).pipe();
  }
  getfrom50to100(page = 1, size = 10): Observable<any> {
    return this.http.get(`${this.productUrl3}?page=${page}&size=${size}`).pipe();
  }
  getfrom100to200(page = 1, size = 10): Observable<any> {
    return this.http.get(`${this.productUrl4}?page=${page}&size=${size}`).pipe();
  }
  getabove200(page = 1, size = 10): Observable<any> {
    return this.http.get(`${this.productUrl5}?page=${page}&size=${size}`).pipe();
  }

    getDetail(id: String): Observable<ProductInfo> {
        const url = `${this.productUrl}/${id}`;
        return this.http.get<ProductInfo>(url).pipe(
            catchError(_ => {
                console.log("Get Detail Failed");
                return of(new ProductInfo());
            })
        );
    }

    update(productInfo: ProductInfo): Observable<ProductInfo> {
        const url = `${apiUrl}/seller/product/${productInfo.productId}/edit`;
        return this.http.put<ProductInfo>(url, productInfo);
    }

    create(productInfo: ProductInfo): Observable<ProductInfo> {
        const url = `${apiUrl}/seller/product/new`;
        return this.http.post<ProductInfo>(url, productInfo);
    }


  deleteProduct1(productId: ProductInfo): Observable<any> {
    return this.http.delete<any>(`${this.baseurl}/${productId}`);
  }
  addFavouriteProduct(productInfo: ProductInfo) {

    const a: ProductInfo[] = JSON.parse(localStorage.getItem("avf_item")) || [];
    a.push(productInfo);
    this.toastr.success("Adding Product", "Adding Product as Favourite");
    setTimeout(() => {
      localStorage.setItem("avf_item", JSON.stringify(a));
    }, 1500);

  }
  getLocalFavouriteProducts(): ProductInfo[] {
    const productInfo: ProductInfo[] =
      JSON.parse(localStorage.getItem("avf_item")) || [];

    return productInfo;
  }


    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            console.error(error); // log to console instead


            return of(result as T);
        };
    }
}
