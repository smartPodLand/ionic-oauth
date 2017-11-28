import {Component} from '@angular/core';
import {InAppBrowser, InAppBrowserEvent} from '@ionic-native/in-app-browser';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/map';
import {Dialogs} from '@ionic-native/dialogs';
import {ConfigModule} from '../../config';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    isLogin: boolean = false;//this check user state (login or not login)
    username: string;
    email: string;
    phone: string;
    sw: boolean;//this show user user_info
    getTokenUrl: string = this.config.sso + 'token/';
    loginUrl: string = this.config.sso + 'authorize/?client_id=' + this.config.client_id + '&response_type=code&redirect_uri=' + this.config.redirect_uri;
    logOutUrl: string = this.config.sso + 'logout/';
    infoUrl: string = this.config.sso_service + 'user';
    signUpUrl: string = this.config.sso + 'authorize/?client_id=' + this.config.client_id + '&response_type=code&redirect_uri=' + this.config.redirect_uri + '&prompt=signup';

    constructor(public iab: InAppBrowser, public http: Http, private storage: Storage, public config: ConfigModule, public dialogs: Dialogs) {

        setTimeout(() => {//this is for run app
            this.checkLogin();
        }, 1);
    }


    login() {
        //receive code from server
        let browser = this.iab.create(this.loginUrl, '_self', 'location=no');
        let code: string[];
        browser.on('loadstart').subscribe(
            (e: InAppBrowserEvent) => {
                let urlCode = e.url;
                code = urlCode.split('?code=');
                if (code[0] == this.config.redirect_uri) {
                    browser.close();
                }
            }
        );
        //get token from server
        browser.on('exit').subscribe(
            () => {
                let request_body = "client_id=" + this.config.client_id + "&client_secret=" + this.config.client_secret + "&code=" + code[1] + "&redirect_uri=" + this.config.redirect_uri + "&grant_type=authorization_code";
                let request_header = new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded'
                });
                let request_option = new RequestOptions({'headers': request_header});
                this.http.post(this.getTokenUrl, request_body, request_option)
                    .map(res => res.json()).subscribe(data => {
                        //save token in the local storage
                        this.storage.set('access_token', data['access_token']).then(
                            () => {
                                this.storage.set('refresh_token', data['refresh_token']).then(
                                    () => {
                                        this.isLogin = true;
                                        location.reload();

                                    }
                                );
                            }, error => console.log(JSON.stringify(error)));
                    }
                );
            });
    }

    logOut() {
        //this is for logout user
        let browser = this.iab.create(this.logOutUrl, '_self', 'location=no');
        browser.on('loadstop').subscribe(
            () => {
                //remove access_token
                this.storage.remove('access_token').then(() => {
                        this.storage.remove('refresh_token').then(() => {
                            alert("شما با موفقیت خارج شدید!");
                            this.isLogin = false;
                            browser.close();
                            location.reload();
                        });
                    }
                );
            }
        );
    }


    user_info() {
        this.storage.get('access_token').then(value => {
            let request_header = new Headers({
                'Authorization': 'Bearer ' + value
            });
            let request_option = new RequestOptions({'headers': request_header})
            this.http.get(this.infoUrl, request_option)//receive information from server
                .map(res => res.json()).subscribe(data => {
                this.email = data['email'];
                this.username = data['preferred_username'];
                this.phone = data['phone_number'];
                this.sw = true;
            }, error => {
                console.log(JSON.stringify(error))
            });
        })
    }

    back() {
        //this is back button in user user_info
        this.sw = false;
    }

    checkLogin() {
        //this check user state at the first of run app
        this.storage.get('access_token').then(value => {
            if (value != null) {
                this.isLogin = true;
            }
            else {
                this.isLogin = false;
            }
        }, err => console.log(JSON.stringify(err)));
    }


    signUp() {
        //signup func
        this.iab.create(this.signUpUrl, '_self', 'location=no');
    }

}
