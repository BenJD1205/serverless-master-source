import { plainToClass } from 'class-transformer';
import { APIGatewayEvent } from "aws-lambda";
import { SuccessResponse, ErrorResponse } from "../utility/response";
import { ProductRepository } from "../repository/product-repository";
import { ProductDto } from '../dto/productDto';
import { AppValidationError } from '../utility/error';
import { CategoryRepository } from '../repository/category-repository';

export class ProductService {

    _repository: ProductRepository;
    constructor(repository: ProductRepository) {
        this._repository = repository;
    }

    async ResponseWithError(event: APIGatewayEvent) {
        return ErrorResponse(404, new Error("method not allowed"))
    }

    async createProduct(event: APIGatewayEvent) {
        const input = plainToClass(ProductDto, JSON.parse(event.body!));
        const error = await AppValidationError(input);
        if (error) return ErrorResponse(404, error);
        const data = await this._repository.createProduct(input);
        await new CategoryRepository().addItem({ id: input.category_id, products: [data._id] })
        return SuccessResponse(data)
    }

    async getProducts() {
        const data = await this._repository.getProduct();
        return SuccessResponse(data)
    }

    async getProduct(event: APIGatewayEvent) {
        const productId = event.pathParameters?.id;
        if (!productId) return ErrorResponse(403, "please provide product id")
        const data = await this._repository.getProductById(productId);
        return SuccessResponse(data);
    }

    async updateProduct(event: APIGatewayEvent) {
        const productId = event.pathParameters?.id;
        if (!productId) return ErrorResponse(403, "please provide product id")
        const input = plainToClass(ProductDto, JSON.parse(event.body!));
        const error = await AppValidationError(input);
        if (error) return ErrorResponse(404, error);
        input.id = productId;
        const data = await this._repository.updateProduct(input);
        return SuccessResponse(data);
    }

    async deleteProduct(event: APIGatewayEvent) {
        const productId = event.pathParameters?.id;
        if (!productId) return ErrorResponse(403, "please provide product id")
        const { category_id, deleteResult } = await this._repository.deleteProduct(productId);
        await new CategoryRepository().removeItem({
            id: category_id,
            products: [productId],
        })
        return SuccessResponse(deleteResult);
    }

}