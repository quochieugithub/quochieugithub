import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {Subscription} from "rxjs";
import {JwtResponse} from "../../response/JwtResponse";
import {Router} from "@angular/router";
import {Role} from "../../enum/Role";
import {TranslateService} from '../../services/translate.service';

@Component({
    selector: 'app-size',
    templateUrl: './size.component.html',
    styleUrls: ['./size.component.css']
})
export class SizeComponent implements OnInit, OnDestroy {

    currentUserSubscription: Subscription;
    name$;
    name: string;
    currentUser: JwtResponse;
    root = '/';
    Role = Role;

    constructor(private userService: UserService,
                private router: Router,
                public translate: TranslateService
    ) {

    }


    ngOnInit() {
        this.name$ = this.userService.name$.subscribe(aName => this.name = aName);
        this.currentUserSubscription = this.userService.currentUser.subscribe(user => {
            this.currentUser = user;
            if (!user || user.role == Role.Customer) {
                this.root = '/';
            } else {
                this.root = '/seller';
            }
        });
    }

    ngOnDestroy(): void {
        this.currentUserSubscription.unsubscribe();
        // this.name$.unsubscribe();
    }

    logout() {
        this.userService.logout();
        // this.router.navigate(['/login'], {queryParams: {logout: 'true'}} );
    }
  setLang(lang: string) {
    // console.log("Language", lang);
    this.translate.use(lang).then(() => {});
  }

}
