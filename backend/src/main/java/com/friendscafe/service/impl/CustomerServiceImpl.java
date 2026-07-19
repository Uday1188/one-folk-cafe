package com.friendscafe.service.impl;

import com.friendscafe.dto.CustomerDto;
import com.friendscafe.entity.Customer;
import com.friendscafe.exception.ResourceNotFoundException;
import com.friendscafe.mapper.CustomerMapper;
import com.friendscafe.repository.CustomerRepository;
import com.friendscafe.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Override
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return customerMapper.toDto(customer);
    }

    @Override
    public CustomerDto getCustomerByMobile(String mobile) {
        Customer customer = customerRepository.findFirstByMobileOrderByIdDesc(mobile)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with mobile: " + mobile));
        return customerMapper.toDto(customer);
    }

    @Override
    public CustomerDto createCustomer(CustomerDto customerDto) {
        return customerRepository.findFirstByMobileOrderByIdDesc(customerDto.getMobile())
                .map(existingCustomer -> {
                    // Option B: Update name if it has changed
                    if (!existingCustomer.getName().equals(customerDto.getName())) {
                        existingCustomer.setName(customerDto.getName());
                        customerRepository.save(existingCustomer);
                    }
                    return customerMapper.toDto(existingCustomer);
                })
                .orElseGet(() -> {
                    Customer newCustomer = customerMapper.toEntity(customerDto);
                    Customer savedCustomer = customerRepository.save(newCustomer);
                    return customerMapper.toDto(savedCustomer);
                });
    }
}
