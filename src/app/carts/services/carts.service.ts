import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartsService {

  constructor(private Http:HttpClient) { }
  creatNewCart(Model:any){
  return this.Http.post('https://fakestoreapi.com/carts',Model)
  }
}
