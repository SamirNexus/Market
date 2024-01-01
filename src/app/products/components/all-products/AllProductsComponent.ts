import { Component, OnInit  } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { product } from '../../models/product';

@Component({
  selector: 'app-all-products',
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.scss']
})
export class AllProductsComponent implements OnInit {
  
  products:product[] = [];
  categorise:string[] = [];
  loading:boolean = false;
  cartProducts:any[]=[];
  
// i use indpendency injection here to accsess api in this componet (private service: ProductsService) and i used observable to link data between front and back such as (subscribe)
  constructor(private service: ProductsService) { }
   ngOnInit(): void {
    //write here all method witch i need rum when page load 
    this.getProducts();
    this.getCategories();
  }
  getProducts() {
    this.loading = true
    this.service.getAllproducts().subscribe((res:any) => {
      this.products = res;
      this.loading = false
    }
   ,error=>{
    alert(error)
   });
  }
  getCategories() {
    this.loading = true
    this.service.getAllCategories().subscribe((res:any) => {
      this.categorise = res;
      this.loading = false
      console.log(res)
    }
   ,error=>{
    this.loading = false
   alert(error)
   });
  }
  // filter work ==> take data as Parameter and go to service to concatination with api  witch i work on it 
  filtterCategory(event:any){
    // event.target ==> what the user choose in categorise
    let value = event.target.value;
    // if categorie = all return all categorie  else  give me selected categorie 
    // short condition 
    (value == "All") ? this.getProducts():this.getproductsCategory(value)
  }
  getproductsCategory(keyword:string){
    this.loading = true
    this.service.getProductsInASpecificCategory(keyword).subscribe((res:any)=>{
      this.loading = false
        this.products = res;
    })

    }
    
    addtoCart(event:any){
      // first i take data from array to localStorage then push new data in array then push it in localstorge.
      // to avoid over wright data i make array and push data in it then push in local storage to make it updated and avoid overwright data.
      // JSON.stringify() send data
        // JSON.parse() Recieve data
    if("cart" in localStorage){
      this.cartProducts = JSON.parse(localStorage.getItem('cart')!) //! to avoid null 
      let exist = this.cartProducts.find(item=>item.item.id == event.item.id)
      // cheak if product in cart or no.
      if(exist){
        alert('PROUDUCT IS ALREADY IN YOUR CART')
      }else{
        this.cartProducts.push(event)
        localStorage.setItem('cart',JSON.stringify(this.cartProducts))
      }
    }else{
      this.cartProducts.push(event)
      localStorage.setItem('cart',JSON.stringify(this.cartProducts))
    }
    }

  }