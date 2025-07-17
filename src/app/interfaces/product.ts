    export interface Product {
    id? : number;
    name: string;
    description : string;
    price : number;
    stock: number
    }

    export interface ProductResponse {
        msg: string;
        data: Product[];
      }