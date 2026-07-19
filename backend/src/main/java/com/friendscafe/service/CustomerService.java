package com.friendscafe.service;

import com.friendscafe.dto.CustomerDto;
import java.util.List;

public interface CustomerService {
    List<CustomerDto> getAllCustomers();
    CustomerDto getCustomerById(Long id);
    CustomerDto getCustomerByMobile(String mobile);
    CustomerDto createCustomer(CustomerDto customerDto);
}
