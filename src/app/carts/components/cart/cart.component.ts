import { CartsService } from './../../services/carts.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl:'./cart.component.html' ,
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  constructor(private service:CartsService){}
  cartProducts:any[]=[]
  success:boolean=false
  totalprice:any = 0
  ngOnInit():void{
  this.getCartproducts()
  }
    getCartproducts(){
      if("cart" in localStorage ){
        this.cartProducts = JSON.parse(localStorage.getItem('cart')!) 
    }
   this.getCartsTotalPrice()
  }
  addAmount(index:number)
  {
   this.cartProducts[index].quantity++
   this.getCartsTotalPrice()
   localStorage.setItem('cart',JSON.stringify(this.cartProducts))
  }
  minsAmount(index:number){
    this.cartProducts[index].quantity--
    this.getCartsTotalPrice()
    localStorage.setItem('cart',JSON.stringify(this.cartProducts))
  }
  detectChange()
  {
    this.getCartsTotalPrice()
    localStorage.setItem('cart',JSON.stringify(this.cartProducts))
  }
  deleteProuduct(index:number){
    this.cartProducts.splice(index,1)
    this.getCartsTotalPrice()
    localStorage.setItem('cart',JSON.stringify(this.cartProducts))
  }
  clearCart()
  {
    this.cartProducts = []
    this.getCartsTotalPrice()
    localStorage.setItem('cart',JSON.stringify(this.cartProducts))
  }
  getCartsTotalPrice(){
    this.totalprice = 0;
    for(let x in this.cartProducts){
      this.totalprice += this.cartProducts[x].item.price * this.cartProducts[x].quantity
    }
  }
  addcart()
  {
    let products = this.cartProducts.map(item=>{
      return{productId:item.item.id, quantity:item.quantity}
    })
    let Model = {
      userId :5,
      date : new Date(),
      products : products
    }
    this.service.creatNewCart(Model).subscribe(res=>{
    this.success=true
    })
    console.log(Model)
  }
  }


