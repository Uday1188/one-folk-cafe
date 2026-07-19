package com.friendscafe.service;

import com.friendscafe.dto.CafeTableDto;
import java.util.List;

public interface CafeTableService {
    List<CafeTableDto> getAllTables();
    CafeTableDto addTable(CafeTableDto request);
    void deleteTable(Long id);
    CafeTableDto updateTableStatus(Long id, String status);
}
