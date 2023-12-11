import mongoose from 'mongoose';

export type ProductModel = {
    name: string;
    description: string;
    category_id: string;
    image_url: string;
    price: number;
    availability: boolean;
}

export type ProductDoc = mongoose.Document & ProductModel;

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    category_id: String,
    image_url: String,
    price: Number,
    availability: Boolean,
}, {
    toJSON: {
        transform(doc, ret, options) {
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamp: true,
})

const product = mongoose.models.product || mongoose.model<ProductDoc>("products", productSchema);
export { product }