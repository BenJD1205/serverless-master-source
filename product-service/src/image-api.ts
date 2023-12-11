import { S3 } from "aws-sdk";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 as uuid } from "uuid";
const S3Client = new S3();

export const handler = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    // grab the fileName from queryString
    const file = event.queryStringParameters?.file;
    // give unique name of that file
    const fileName = `${uuid()}__${file}`;

    // create S3Params
    const s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        ContentType: "image/jpeg",
    };
    // get Signed URL
    const url = await S3Client.getSignedUrlPromise("putObject", s3Params);

    console.log("UPLOAD URL:", s3Params, url);

    // give to back to client for upload image
    return {
        statusCode: 200,
        body: JSON.stringify({
            url,
            Key: fileName,
        }),
    };
};
