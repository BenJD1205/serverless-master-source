import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import middy from '@middy/core';
import bodyParser from '@middy/http-json-body-parser';
import { CategoryService } from './services/category-service';
import { CategoryRepository } from "./repository/category-repository";

const service = new CategoryService(new CategoryRepository())

export const handler = middy((
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const isRoot = event.pathParameters === null;

    switch (event.httpMethod.toLowerCase()) {
        case "post":
            if (isRoot) {
                return service.createCategory(event);
            }
            break;
        case "get":
            console.log('hI')
            return isRoot ? service.getCategories(event) : service.getCategory(event)
        case "put":
            if (!isRoot) {
                return service.updateCategory(event);
            }
        case "delete":
            if (!isRoot) {
                return service.deleteCategory(event);
            }
        default:
            break;
    }

    return service.ResponseWithError(event);
}).use(bodyParser())