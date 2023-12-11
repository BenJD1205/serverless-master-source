import { ProductDto } from "../dto/productDto";
import { ProductDoc, product } from "../models";
export class ProductRepository {
    constructor() { }

    async createProduct({ name, description, price, category_id, image_url }: ProductDto) {
        return product.create({
            name,
            description,
            price,
            category_id,
            image_url,
            availability: true,
        })
    }

    async getProduct(offset = 0, page?: number) {
        return product.find().skip(offset).limit(page ? page : 500)
    }

    async getProductById(id: string) {
        return product.findById(id);
    }

    async updateProduct({ id, name, description, price, category_id, image_url, availability }: ProductDto) {
        let existingProduct = await product.findById(id) as ProductDoc
        existingProduct.name = name;
        existingProduct.description = description;
        existingProduct.price = price;
        existingProduct.category_id = category_id;
        existingProduct.image_url = image_url;
        existingProduct.availability = availability;
        return existingProduct.save();
    }

    async deleteProduct(id: string) {
        const { category_id } = await product.findById(id) as ProductDoc;
        const deleteResult = await product.deleteOne({ _id: id });
        return { category_id, deleteResult };
    }
}