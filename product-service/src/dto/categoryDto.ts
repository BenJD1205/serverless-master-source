import { Length } from "class-validator";

export class CategoryDto {
    id: string;

    @Length(3, 128)
    name: string;

    parentId?: string;

    products: string[];

    displayOrder: number;

    imageUrl: string;
}

export class AddItemDto {
    @Length(3, 128)
    id: string;

    products: string[];
}