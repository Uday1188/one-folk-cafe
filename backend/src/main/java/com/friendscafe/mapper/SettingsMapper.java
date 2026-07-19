package com.friendscafe.mapper;

import com.friendscafe.dto.SettingsDto;
import com.friendscafe.entity.Settings;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SettingsMapper {
    SettingsDto toDto(Settings settings);

    @Mapping(target = "id", ignore = true)
    Settings toEntity(SettingsDto settingsDto);
}
