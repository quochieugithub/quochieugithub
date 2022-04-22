import {AfterContentChecked, Component, OnDestroy, OnInit} from '@angular/core';
import {CartService} from '../../services/cart.service';
import {Subject, Subscription} from 'rxjs';
import {UserService} from '../../services/user.service';
import {JwtResponse} from '../../response/JwtResponse';
import {ProductInOrder} from '../../models/ProductInOrder';
import {debounceTime, switchMap} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {Role} from '../../enum/Role';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '../../services/translate.service';
import {User} from '../../models/User';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy, AfterContentChecked {

    constructor(private cartService: CartService,
                private userService: UserService,
                private toastr: ToastrService,
                private router: Router,
                public translate: TranslateService
    ) {
        this.userSubscription = this.userService.currentUser.subscribe(user => this.currentUser = user);
    }

    productInOrders = [];
    total = 0;
    currentUser: JwtResponse;
    name$;
    name: string;
    userSubscription: Subscription;

    private updateTerms = new Subject<ProductInOrder>();
    sub: Subscription;

    static validateCount(productInOrder) {
        const max = productInOrder.productStock;
        if (productInOrder.count > max) {
            productInOrder.count = max;
        } else if (productInOrder.count < 1) {
            productInOrder.count = 1;
        }
        console.log(productInOrder.count);
    }

    ngOnInit() {
      this.name$ = this.userService.name$.subscribe(aName => this.name = aName);
        this.cartService.getCart().subscribe(prods => {
            this.productInOrders = prods;
        });

        this.sub = this.updateTerms.pipe(
            debounceTime(300),
            switchMap((productInOrder: ProductInOrder) => this.cartService.update(productInOrder))
        ).subscribe(prod => {
                if (prod) { throw new Error(); }
            },
            _ => console.log('Update Item Failed'));
    }

    ngOnDestroy() {
        if (!this.currentUser) {
            this.cartService.storeLocalCart();
        }
        this.userSubscription.unsubscribe();
    }

    ngAfterContentChecked() {
        this.total = this.productInOrders.reduce(
            (prev, cur) => prev + cur.count * cur.productPrice, 0);
    }

    addOne(productInOrder) {
        productInOrder.count++;
        CartComponent.validateCount(productInOrder);
        if (this.currentUser) { this.updateTerms.next(productInOrder); }
    }

    minusOne(productInOrder) {
        productInOrder.count--;
        CartComponent.validateCount(productInOrder);
        if (this.currentUser) { this.updateTerms.next(productInOrder); }
    }

    onChange(productInOrder) {
        CartComponent.validateCount(productInOrder);
        if (this.currentUser) { this.updateTerms.next(productInOrder); }
    }


    remove(productInOrder: ProductInOrder) {
        this.cartService.remove(productInOrder).subscribe(
            success => {
               this.productInOrders = this.productInOrders.filter(e => e.productId !== productInOrder.productId);
                console.log('Cart: ' + this.productInOrders);
              this.toastr.warning('Remove cart success!', 'Continue shopping!');
            },
            _ => console.log('Remove Cart Failed'));
    }

    checkout() {
        if (!this.currentUser) {
            this.router.navigate(['/login'], {queryParams: {returnUrl: this.router.url}});
        } else if (this.currentUser.role !== Role.Customer) {
            this.router.navigate(['/seller']);
        } else {
            this.cartService.checkout().subscribe(
                _ => {
                    this.productInOrders = [];
                  this.toastr.success('Waiting for approval', 'Checkout Cart Success!!');
                },
                error1 => {
                    console.log('Checkout Cart Failed');
                });
            this.router.navigate(['/']);
        }

    }
  setLang(lang: string) {
    this.translate.use(lang).then(() => {});
  }
}

