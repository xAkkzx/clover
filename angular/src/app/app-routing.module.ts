import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LocalizedString } from '@angular/compiler';
import { LoginComponent } from './login/login.component';
const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'register', component: RegisterComponent }
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
