package com.friendscafe.service;

import com.friendscafe.dto.SettingsDto;

public interface SettingsService {
    SettingsDto getSettings();
    SettingsDto updateSettings(SettingsDto settingsDto);
}
