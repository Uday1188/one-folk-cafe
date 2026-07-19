package com.friendscafe.service.impl;

import com.friendscafe.dto.CafeTableDto;
import com.friendscafe.entity.CafeTable;
import com.friendscafe.exception.ResourceNotFoundException;
import com.friendscafe.repository.CafeTableRepository;
import com.friendscafe.service.CafeTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CafeTableServiceImpl implements CafeTableService {

    private final CafeTableRepository cafeTableRepository;

    private CafeTableDto mapToDto(CafeTable table) {
        CafeTableDto dto = new CafeTableDto();
        dto.setId(table.getId());
        dto.setTableNumber(table.getTableNumber());
        dto.setCapacity(table.getCapacity());
        dto.setStatus(table.getStatus());
        return dto;
    }

    @Override
    public List<CafeTableDto> getAllTables() {
        return cafeTableRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CafeTableDto addTable(CafeTableDto request) {
        if (cafeTableRepository.existsByTableNumber(request.getTableNumber())) {
            throw new IllegalArgumentException("Table number already exists!");
        }

        CafeTable table = CafeTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 4)
                .status("AVAILABLE")
                .build();
        
        CafeTable saved = cafeTableRepository.save(table);
        return mapToDto(saved);
    }

    @Override
    public void deleteTable(Long id) {
        CafeTable table = cafeTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        cafeTableRepository.delete(table);
    }

    @Override
    public CafeTableDto updateTableStatus(Long id, String status) {
        CafeTable table = cafeTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        table.setStatus(status);
        CafeTable saved = cafeTableRepository.save(table);
        return mapToDto(saved);
    }
}
