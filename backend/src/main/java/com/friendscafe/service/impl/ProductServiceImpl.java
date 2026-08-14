package com.friendscafe.service.impl;

import com.friendscafe.dto.ProductDto;
import com.friendscafe.entity.Category;
import com.friendscafe.entity.Product;
import com.friendscafe.exception.ResourceNotFoundException;
import com.friendscafe.mapper.ProductMapper;
import com.friendscafe.repository.CategoryRepository;
import com.friendscafe.repository.ProductRepository;
import com.friendscafe.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Override
    public List<ProductDto> getAllProducts() {
        return productRepository.findAllByOrderByIdAsc().stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toDto(product);
    }

    @Override
    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDto.getCategoryId()));

        // Validate half plate configuration
        if (Boolean.TRUE.equals(productDto.getHalfPlateAvailable())) {
            if (productDto.getHalfPlatePrice() == null || productDto.getHalfPlatePrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Half plate price must be greater than 0 when half plate is enabled");
            }
            if (productDto.getHalfPlatePrice().compareTo(productDto.getFullPlatePrice()) > 0) {
                throw new IllegalArgumentException("Half plate price cannot be greater than full plate price");
            }
        } else {
            productDto.setHalfPlatePrice(null); // Clear half plate price if not available
        }

        Product product = productMapper.toEntity(productDto);
        product.setCategory(category);
        if (product.getAvailable() == null) {
            product.setAvailable(true);
        }
        if (product.getHalfPlateAvailable() == null) {
            product.setHalfPlateAvailable(false);
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toDto(savedProduct);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDto.getCategoryId()));

        // Validate half plate configuration
        if (Boolean.TRUE.equals(productDto.getHalfPlateAvailable())) {
            if (productDto.getHalfPlatePrice() == null || productDto.getHalfPlatePrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Half plate price must be greater than 0 when half plate is enabled");
            }
            if (productDto.getHalfPlatePrice().compareTo(productDto.getFullPlatePrice()) > 0) {
                throw new IllegalArgumentException("Half plate price cannot be greater than full plate price");
            }
        } else {
            productDto.setHalfPlatePrice(null); // Clear half plate price if not available
        }

        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setFullPlatePrice(productDto.getFullPlatePrice());
        product.setHalfPlatePrice(productDto.getHalfPlatePrice());
        product.setHalfPlateAvailable(productDto.getHalfPlateAvailable() != null ? productDto.getHalfPlateAvailable() : false);
        product.setImageUrl(productDto.getImageUrl());
        product.setCategory(category);
        product.setAvailable(productDto.getAvailable());

        Product updatedProduct = productRepository.save(product);
        return productMapper.toDto(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }
}
