import { NgModule, InjectionToken } from '@angular/core';
import { Routes, Router, RouterModule, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserInfoComponent } from './user-info/user-info.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: 'user',
    component: UserInfoComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'https:',
    component: UserInfoComponent
  },
  {
    path: '',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
