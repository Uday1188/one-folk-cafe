package com.friendscafe.mapper;

import com.friendscafe.dto.OrderDto;
import com.friendscafe.dto.OrderItemDto;
import com.friendscafe.entity.Order;
import com.friendscafe.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class})
public interface OrderMapper {

    OrderDto toDto(Order order);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    OrderItemDto toDto(OrderItem orderItem);
}
