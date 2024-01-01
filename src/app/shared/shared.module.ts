import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './component/header/header.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from "@angular/common/http";
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SelectComponent } from './components/select/select.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    HeaderComponent,
    SpinnerComponent,
    SelectComponent,
    
    
    
    
  ],
  //router moudule  ==> it used to rout between  module ,router link have directive in router module so if i need work router link i should import router module.
  //HttpClientModule ==> it used to make api work  , so when  i call api in service througt http client witch independ on it 
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    
  
    
  

  ],
   exports:[
    HeaderComponent,
    SpinnerComponent,
    SelectComponent,
    FormsModule,
    
    
   ]
})
export class SharedModule { }
