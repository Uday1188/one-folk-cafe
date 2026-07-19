package com.friendscafe.service;

import com.friendscafe.entity.OrderStatus;
import com.friendscafe.repository.OrderItemRepository;
import com.friendscafe.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService implements IAnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Map<String, Object> getDashboardMetrics(String filter) {
        Map<String, Object> metrics = new HashMap<>();
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        // Today's summary card (always today regardless of filter)
        Double todaysSales = orderRepository.sumRevenueInDateRange(startOfDay, endOfDay);
        metrics.put("todaysSales", todaysSales != null ? todaysSales : 0.0);
        long todaysOrdersCount = orderRepository.countOrdersInDateRange(startOfDay, endOfDay);
        metrics.put("todaysOrders", todaysOrdersCount);

        // Calculate dynamic date range based on filter
        LocalDateTime startDate = startOfDay;
        LocalDateTime endDate = endOfDay;
        
        if ("monthly".equalsIgnoreCase(filter)) {
            startDate = LocalDate.now().minusMonths(12).withDayOfMonth(1).atStartOfDay();
        } else if ("weekly".equalsIgnoreCase(filter)) {
            startDate = LocalDate.now().minusWeeks(12).atStartOfDay(); // Last 12 weeks
        } else {
            // daily (default) - last 30 days
            startDate = LocalDate.now().minusDays(30).atStartOfDay();
        }

        // Fetch charts data based on dynamic date range
        List<Object[]> revenueTrend;
        if ("monthly".equalsIgnoreCase(filter)) {
            revenueTrend = orderRepository.getMonthlyRevenueTrend(startDate, endDate);
        } else if ("weekly".equalsIgnoreCase(filter)) {
            revenueTrend = orderRepository.getWeeklyRevenueTrend(startDate, endDate);
        } else {
            revenueTrend = orderRepository.getDailyRevenueTrend(startDate, endDate);
        }

        List<Map<String, Object>> revenueChartData = revenueTrend.stream().map(r -> {
            Map<String, Object> point = new HashMap<>();
            point.put("label", r[0]);
            point.put("revenue", r[1]);
            return point;
        }).collect(Collectors.toList());
        metrics.put("revenueChartData", revenueChartData);

        // Fetch Pie Chart Data (Order Status distribution for the selected time range)
        List<Object[]> statusCounts = orderRepository.countOrdersByStatusInDateRange(startDate, endDate);
        List<Map<String, Object>> orderStatusPieData = statusCounts.stream().map(r -> {
            Map<String, Object> point = new HashMap<>();
            point.put("name", r[0] != null ? ((OrderStatus)r[0]).name() : "UNKNOWN");
            point.put("value", r[1]);
            return point;
        }).collect(Collectors.toList());
        metrics.put("orderStatusPieData", orderStatusPieData);

        // Calculate total summary counts for the selected time range (for the cards)
        long pending = 0, preparing = 0, completed = 0, cancelled = 0;
        for (Map<String, Object> point : orderStatusPieData) {
            String status = (String) point.get("name");
            long count = (long) point.get("value");
            switch (status) {
                case "PENDING": pending = count; break;
                case "PREPARING": preparing = count; break;
                case "COMPLETED": completed = count; break;
                case "CANCELLED": cancelled = count; break;
            }
        }
        
        metrics.put("pendingOrdersCount", pending);
        metrics.put("preparingOrdersCount", preparing);
        metrics.put("completedOrdersCount", completed);
        metrics.put("cancelledOrdersCount", cancelled);

        return metrics;
    }

    @Override
    public List<Map<String, Object>> getTopSellingProducts(int limit) {
        LocalDateTime startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
        
        List<Object[]> results = orderItemRepository.findTopSellingProducts(startOfMonth, endOfMonth, PageRequest.of(0, limit));
        
        return results.stream().map(result -> {
            Map<String, Object> productStat = new HashMap<>();
            productStat.put("productId", result[0]);
            productStat.put("totalQuantity", result[1]);
            return productStat;
        }).collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getTopProductsByRevenue(String filter, int limit) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        LocalDateTime startDate = startOfDay;
        LocalDateTime endDate = endOfDay;
        
        if ("monthly".equalsIgnoreCase(filter)) {
            startDate = LocalDate.now().minusMonths(12).withDayOfMonth(1).atStartOfDay();
        } else if ("weekly".equalsIgnoreCase(filter)) {
            startDate = LocalDate.now().minusWeeks(12).atStartOfDay();
        } else {
            startDate = LocalDate.now().minusDays(30).atStartOfDay();
        }

        List<Object[]> results = orderItemRepository.findTopProductsByRevenue(startDate, endDate, PageRequest.of(0, limit));
        
        return results.stream().map(result -> {
            Map<String, Object> stat = new HashMap<>();
            stat.put("product", result[0]);
            stat.put("orders", result[1]);
            stat.put("revenue", result[2]);
            return stat;
        }).collect(Collectors.toList());
    }
}
