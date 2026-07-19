package com.friendscafe.service.impl;

import com.friendscafe.dto.SettingsDto;
import com.friendscafe.entity.Settings;
import com.friendscafe.exception.ResourceNotFoundException;
import com.friendscafe.mapper.SettingsMapper;
import com.friendscafe.repository.SettingsRepository;
import com.friendscafe.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsServiceImpl implements SettingsService {

    private final SettingsRepository settingsRepository;
    private final SettingsMapper settingsMapper;

    @Override
    public SettingsDto getSettings() {
        Settings settings = settingsRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found"));
        return settingsMapper.toDto(settings);
    }

    @Override
    @Transactional
    public SettingsDto updateSettings(SettingsDto settingsDto) {
        Settings settings = settingsRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found"));
        
        settings.setCafeName(settingsDto.getCafeName());
        settings.setAddress(settingsDto.getAddress());
        settings.setPhone(settingsDto.getPhone());
        settings.setEmail(settingsDto.getEmail());
        settings.setOpenTime(settingsDto.getOpenTime());
        settings.setCloseTime(settingsDto.getCloseTime());
        settings.setInstagramLink(settingsDto.getInstagramLink());
        settings.setDescription(settingsDto.getDescription());
        settings.setOurStoryImage(settingsDto.getOurStoryImage());
        settings.setFeaturedProductIds(settingsDto.getFeaturedProductIds());

        Settings updatedSettings = settingsRepository.save(settings);
        return settingsMapper.toDto(updatedSettings);
    }
}
