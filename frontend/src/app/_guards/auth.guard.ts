import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from "../services/user.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {


    constructor(
        private router: Router,
        private userService: UserService
    ) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const currentUser = this.userService.currentUserValue;
        if (currentUser) {

// kiểm tra xem route có bị hạn chế bởi vai trò không
            if (route.data.roles && route.data.roles.indexOf(currentUser.role) === -1) {
                console.log(currentUser.role + "fail in " + route.data.roles);

// vai trò không được ủy quyền nên chuyển hướng đến trang chủ
                this.router.navigate(['/']);
                return false;
            }

// được ủy quyền nên trả về true
            return true;
        }

        console.log("Need log in");

// chưa đăng nhập nên chuyển hướng đến trang đăng nhập
        this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
        return false;
    }
}
