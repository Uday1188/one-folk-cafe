package com.friendscafe.mapper;

import com.friendscafe.dto.CategoryDto;
import com.friendscafe.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryDto toDto(Category category);

    @Mapping(target = "products", ignore = true)
    Category toEntity(CategoryDto categoryDto);
}
