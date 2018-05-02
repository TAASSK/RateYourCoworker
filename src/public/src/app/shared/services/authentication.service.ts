/*
 * Angular library
 * */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { userService } from './user.service';

@Injectable()

export class AuthenticationService extends RepositoryService<User> {

	protected endPoint = 'http://localhost:8080/api/login';
	//user: User; 
	//userServices: userService;

	constructor(
		protected httpClient: HttpClient,
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


		var obj = {
			email: email,
			password: password
    }
    console.log(obj);
    const item = JSON.stringify(obj);
		return this.httpClient.post(`${this.endPoint}`,
      item, this.httpOptions)
    .do(res => {
      this.setSession(res);
    })
    .pipe(catchError(this.handleException));
  }



// 		return this.httpClient.post(
// 			`${this.endPoint}`,
// 			{email, password},
// 			this.httpOptions)
// 		.pipe(catchError(this.handleException));

//	}




	private setSession(authResult: object) {
		// const expiresAt = moment().add(authResult.expires_at, 'second');
    console.log(localStorage + 'hmm');

    localStorage.setItem('token', authResult['token']);
    // localStorage.setItem('expires_at', authResult['expires_at']);

		// localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));

  }

  public getToken() {
    const token = localStorage.getItem('token');
    console.log(token);
    return token;
}

public logOut() {
		localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    console.log(localStorage);
    console.log('testStoreage');


  }
  protected handleException(exception: any) {
    let message = `${exception.status} : ${exception.statusText}\r\n${exception.message}`;
    alert(message);
    return Observable.throw(exception);
  }
}
