import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const handler = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    console.log(`EVENT: ${JSON.stringify(event)}`)

    return {
        statusCode: 500,
        body: JSON.stringify({
            message: 'hello from product service',
            path: `${event.path} ${event.pathParameters}`
        })
    }
}