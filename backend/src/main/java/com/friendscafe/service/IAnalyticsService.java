package com.friendscafe.service;

import java.util.List;
import java.util.Map;

public interface IAnalyticsService {
    Map<String, Object> getDashboardMetrics(String filter);
    List<Map<String, Object>> getTopSellingProducts(String filter, int limit);
    List<Map<String, Object>> getTopProductsByRevenue(String filter, int limit);
}
