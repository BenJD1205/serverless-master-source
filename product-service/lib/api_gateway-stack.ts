import { LambdaIntegration, LambdaRestApi, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { aws_apigateway } from "aws-cdk-lib";

interface ApiGatewayStackProps {
    productService: IFunction;
    categoryService: IFunction;
    dealsService: IFunction;
    imageService: IFunction;
}

interface ResourceType {
    name: string;
    methods: string[];
    child?: ResourceType;
}

export class ApiGatewayStack extends Construct {
    constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
        super(scope, id)
        this.addResource("product", props)
    }

    addResource(serviceName: string, { categoryService, productService, dealsService, imageService }: ApiGatewayStackProps) {
        const apgw = new aws_apigateway.RestApi(this, `${serviceName}-ApiGtw`)

        //product
        this.createEndpoints(productService, apgw, {
            name: "product",
            methods: ["GET", "POST"],
            child: {
                name: "{id}",
                methods: ["GET", "PUT", "DELETE"]
            }
        })

        //category
        this.createEndpoints(categoryService, apgw, {
            name: "category",
            methods: ["GET", "POST"],
            child: {
                name: "{id}",
                methods: ["GET", "PUT", "DELETE"]
            }
        })

        //deals
        this.createEndpoints(dealsService, apgw, {
            name: "deals",
            methods: ["GET", "POST"],
            child: {
                name: "{id}",
                methods: ["GET", "PUT", "DELETE"]
            }
        })

        //image
        this.createEndpoints(imageService, apgw, {
            name: "uploader",
            methods: ["GET"],
        })

        // const apgw = new LambdaRestApi(this, `${serviceName}-ApiGtw`, {
        //     restApiName: `${serviceName}-Service`,
        //     handler,
        //     proxy: false,
        // })
        // const productResource = apgw.root.addResource("product")
        // productResource.addMethod("GET")
        // productResource.addMethod("POST")

        // const productIdResource = productResource.addResource("{id}")
        // productIdResource.addMethod("GET")
        // productIdResource.addMethod("PUT")
        // productIdResource.addMethod("DELETE")

        // const categoryResource = apgw.root.addResource("category")
        // categoryResource.addMethod("GET")
        // categoryResource.addMethod("POST")

        // const categoryIdResource = categoryResource.addResource("{id}")
        // categoryIdResource.addMethod("GET")
        // categoryIdResource.addMethod("PUT")
        // categoryIdResource.addMethod("DELETE")

        // const dealsResource = apgw.root.addResource("deals")
        // dealsResource.addMethod("GET")
        // dealsResource.addMethod("POST")

        // const dealsIdResource = dealsResource.addResource("{id}")
        // dealsIdResource.addMethod("GET")
        // dealsIdResource.addMethod("PUT")
        // dealsIdResource.addMethod("DELETE")
    }


    createEndpoints(handler: IFunction, resource: RestApi, { name, methods, child }: ResourceType) {
        const lambdaFunction = new LambdaIntegration(handler)
        const rootResource = resource.root.addResource(name);
        methods.map((item) => {
            rootResource.addMethod(item, lambdaFunction)
        })
        if (child) {
            const childResource = rootResource.addResource(child.name)
            child.methods.map((item) => {
                childResource.addMethod(item, lambdaFunction)
            })
        }
    }
}