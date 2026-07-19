package com.friendscafe.controller;

import com.friendscafe.dto.CafeTableDto;
import com.friendscafe.service.CafeTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CafeTableController {

    private final CafeTableService cafeTableService;

    @GetMapping
    public ResponseEntity<List<CafeTableDto>> getAllTables() {
        return ResponseEntity.ok(cafeTableService.getAllTables());
    }

    @PostMapping
    public ResponseEntity<CafeTableDto> addTable(@RequestBody CafeTableDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cafeTableService.addTable(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        cafeTableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CafeTableDto> updateTableStatus(
            @PathVariable Long id, 
            @RequestParam String status) {
        return ResponseEntity.ok(cafeTableService.updateTableStatus(id, status));
    }
}
