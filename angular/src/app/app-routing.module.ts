import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LocalizedString } from '@angular/compiler';
import { LoginComponent } from './login/login.component';
import { GptComponent} from './gpt/gpt.component'
const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'gpt', component: GptComponent},
  { path: 'register', component: RegisterComponent }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
