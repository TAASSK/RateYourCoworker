/*
 * Angular library
 * */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

/*
 * 3rd party libraries
 * */
import * as moment from 'moment';

/*
 * Models
 * */
import { User } from '../../shared';

/*
 * RxJS
 * */
import 'rxjs/add/operator/do';
import { catchError } from 'rxjs/operators';

/*
 * Services
 * */
import { RepositoryService } from './repository.service';

@Injectable()
export class AuthenticationService extends RepositoryService<User> {

	protected endPoint = 'http://localhost:8080/api/login';

	constructor(
		protected httpClient: HttpClient
	) {
		super(httpClient);
	}

	isAuthenticated(): boolean {
    return true;
	}

	logIn(email: string, password: string) {

		// return this.httpClient.post(
		// 	`${this.endPoint}`,
		// 	{email, password},
		// 	this.httpOptions)
		// .do(res => this.setSession)
		// .pipe(catchError(this.handleException));
    console.log('test');
		return this.httpClient.post(`${this.endPoint}`, {
      email,
      password
    }, this.httpOptions)
    .do(res => {
      this.setSession(res);
    })
    .pipe(catchError(this.handleException));

  }





	private setSession(authResult: object) {
		// const expiresAt = moment().add(authResult.expires_at, 'second');

    localStorage.setItem('token', authResult['token']);
    // localStorage.setItem('expires_at', authResult['expires_at']);

    console.log(localStorage);
		// localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));

  }

  getToken() {
    const token = localStorage.getItem('token');
    console.log(token);
    return token;
  }

	logOut() {

		localStorage.removeItem('id_token');
		localStorage.removeItem('expires_at');

	}
}
