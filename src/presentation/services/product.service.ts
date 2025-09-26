

import { ProductModel } from "../../data";
import { CustomError, PaginationDto } from "../../domain";
import { CreateProductDto } from '../../domain/dtos/products/create-product.dto';

export class ProductService {

    constructor(){}; 

    async createProduct(createProductDto: CreateProductDto){
        const productExists = await ProductModel.findOne({name: createProductDto.name});
        if(productExists) throw CustomError.badRequest('Product already exist');
        try {
            const product = new ProductModel(createProductDto);
            await product.save();
            return product;
 
        }catch(error){
            throw CustomError.internalServer(`${error}`)
        }
    }

    async getProducts(paginationDto: PaginationDto){
        const {page, limit} = paginationDto;
        try{
            const [total, products] = await Promise.all([
                ProductModel.countDocuments(),// total de documentos
                ProductModel.find()// categorias 
                    .skip((page - 1)*limit)
                    .limit(limit)
                    .populate('user')
                    .populate('category')
            ])

            return {
                page: page,
                limit: limit,
                total: total,
                next:`/api/products?page=${(page+1)}&limit=${limit}`,
                prev:(page-1 >0) ? `/api/products?page=${(page-1)}&limit=${limit}`: null,
                categories: products
            }
        }catch(error){
            throw CustomError.internalServer('Internal Server Error')
        }
    }
}

