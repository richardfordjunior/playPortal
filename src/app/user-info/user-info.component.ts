
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import * as endPoint from './../../../src/app/endpoints';


export interface IDataModel {
  handle: string;
  firstName: string;
  lastName: string;
  userType: string;
  accountType: string;
  country: string;
  profilePic: string;
  coverPhoto: string;
  userId: string;
}

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})

export class UserInfoComponent implements OnInit, OnDestroy {
  constructor(
    private _http: HttpClient,
    private _route: ActivatedRoute
  ) { }
  sub;
  sub2;
  subsCalled;
  items: object = {};
  dateString = '';

  ngOnInit() {
    let userCode;
    this._route.queryParams
      .subscribe(params => {
        userCode = params.code;
      });
    this.getAuthData(userCode);
    this.dateString = new Date().toString();
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`
      );
      Promise.resolve(
          this.refreshToken)
          .then(() => {
            this.getProfileData();
           });
    }
    return [];
  }

  getAuthData(code: string) {
    if (code.length === 0) {
      console.log('code not found');
      return;
    }
    const header = new HttpHeaders();
    header.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    const postBody = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://localhost:4200/redirect',
      client_id: endPoint.CLIENT_ID,
      client_secret: endPoint.CLIENT_SECRET
    };

    this.sub = this._http.post(endPoint.AUTH_TOKEN_ENDPOINT, postBody, { headers: header })
      .pipe(
        map(res => res),
        catchError(this.handleError)
    ).subscribe(res => {
        // Use store if time permits
      localStorage.setItem('accessToken', res.access_token);
      localStorage.setItem('refreshToken', res.refresh_token);
    });
    this.getProfileData();
  }

  ngOnDestroy() {
    // Clean up
    this.subsCalled.add(this.sub);
    this.subsCalled.add(this.sub2);
    this.subsCalled.unSubscribe();
  }

  getProfileData(): void {
    const header = new HttpHeaders();
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + localStorage.getItem('accessToken'));
    this._http.get<IDataModel>(endPoint.USER_PROFILE_ENDPOINT, { headers })
      .pipe(
        map(res => res),
        catchError(this.handleError)
      )
      .toPromise()
      .then(res => {
        this.items = Object.entries(res);
      });
  }

  refreshToken(): void {
    const header = new HttpHeaders();
    header.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    const postBody = {
      grant_type: 'refresh_token',
      client_id: endPoint.CLIENT_ID,
      client_secret: endPoint.CLIENT_SECRET,
      refresh_token: localStorage.getItem('refreshToken')
    };

    this.sub2 =  this._http.post(endPoint.REFRESH_TOKEN_ENDPOINT, postBody, { headers: header })
      .pipe(
        map(res => res),
        catchError(this.handleError)
      ).subscribe(res => {
        // Use store if time permits
        localStorage.setItem('refreshToken', res.refresh_token);
      });
  }
}
