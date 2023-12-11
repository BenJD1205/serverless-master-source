import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import middy from '@middy/core';
import bodyParser from '@middy/http-json-body-parser';
import { ErrorResponse } from "./utility/response";
import { ProductService } from "./services/product-service";
import { ProductRepository } from "./repository/product-repository";
import { connectDB } from "./databases/db-connection";

const service = new ProductService(new ProductRepository())

export const handler = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const isRoot = event.pathParameters === null;

    //product
    //pathParameters: null


    //product/1234
    //pathParameters: {id:1234}

    switch (event.httpMethod.toLowerCase()) {
        case "post":
            if (isRoot) {
                return service.createProduct(event);
            }
            break;
        case "get":
            return isRoot ? service.getProducts() : service.getProduct(event)
        case "put":
            if (!isRoot) {
                return service.updateProduct(event);
            }
        case "delete":
            if (!isRoot) {
                return service.deleteProduct(event);
            }
        default:
            break;
    }

    return service.ResponseWithError(event);
};