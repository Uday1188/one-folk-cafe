package com.friendscafe.mapper;

import com.friendscafe.dto.CustomerDto;
import com.friendscafe.entity.Customer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerDto toDto(Customer customer);
    Customer toEntity(CustomerDto customerDto);
}
