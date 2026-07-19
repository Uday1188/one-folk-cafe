package com.friendscafe.mapper;

import com.friendscafe.dto.ProductDto;
import com.friendscafe.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    ProductDto toDto(Product product);

    @Mapping(source = "categoryId", target = "category.id")
    @Mapping(target = "isActive", ignore = true)
    Product toEntity(ProductDto productDto);
}
