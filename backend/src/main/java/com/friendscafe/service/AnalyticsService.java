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

import com.friendscafe.mapper.OrderMapper;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AnalyticsService implements IAnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;

    private LocalDateTime[] getDateRange(String filter) {
        LocalDateTime now = LocalDateTime.now();
        if ("monthly".equalsIgnoreCase(filter)) {
            return new LocalDateTime[]{
                LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay(),
                LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX)
            };
        } else if ("weekly".equalsIgnoreCase(filter)) {
            return new LocalDateTime[]{
                LocalDate.now().minusDays(6).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)
            };
        } else {
            // today or daily (default)
            return new LocalDateTime[]{
                LocalDate.now().atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX)
            };
        }
    }

    @Override
    public Map<String, Object> getDashboardMetrics(String filter) {
        Map<String, Object> metrics = new HashMap<>();
        
        LocalDateTime[] dateRange = getDateRange(filter);
        LocalDateTime startDate = dateRange[0];
        LocalDateTime endDate = dateRange[1];
        
        Double totalOrderValue = orderRepository.sumTotalOrderValueInDateRange(startDate, endDate);
        Double paidRevenue = orderRepository.sumPaidRevenueInDateRange(startDate, endDate);
        Double unpaidAmount = orderRepository.sumUnpaidAmountInDateRange(startDate, endDate);
        
        metrics.put("totalOrderValue", totalOrderValue != null ? totalOrderValue : 0.0);
        metrics.put("todaysSales", paidRevenue != null ? paidRevenue : 0.0); // Paid revenue as sales
        metrics.put("totalSales", paidRevenue != null ? paidRevenue : 0.0);
        metrics.put("unpaidAmount", unpaidAmount != null ? unpaidAmount : 0.0);
        
        long totalOrdersCount = orderRepository.countOrdersInDateRange(startDate, endDate);
        metrics.put("todaysOrders", totalOrdersCount);
        metrics.put("totalOrders", totalOrdersCount);

        // Fetch charts data based on dynamic date range
        List<Object[]> revenueTrend;
        if ("today".equalsIgnoreCase(filter) || "daily".equalsIgnoreCase(filter)) {
            revenueTrend = orderRepository.getHourlyRevenueTrend(startDate, endDate);
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
        long pending = 0, completed = 0, cancelled = 0;
        for (Map<String, Object> point : orderStatusPieData) {
            String status = (String) point.get("name");
            long count = ((Number) point.get("value")).longValue();
            switch (status) {
                case "PENDING": pending = count; break;
                case "COMPLETED": completed = count; break;
                case "CANCELLED": cancelled = count; break;
            }
        }
        
        metrics.put("pendingOrdersCount", pending);
        metrics.put("completedOrdersCount", completed);
        metrics.put("cancelledOrdersCount", cancelled);

        List<Object> recentOrders = orderRepository.findRecentOrdersInDateRange(startDate, endDate, PageRequest.of(0, 10))
                .stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
        metrics.put("recentOrders", recentOrders);

        return metrics;
    }

    @Override
    public List<Map<String, Object>> getTopSellingProducts(String filter, int limit) {
        LocalDateTime[] dateRange = getDateRange(filter);
        List<Object[]> results = orderItemRepository.findTopSellingProducts(dateRange[0], dateRange[1], PageRequest.of(0, limit));
        
        return results.stream().map(result -> {
            Map<String, Object> productStat = new HashMap<>();
            productStat.put("productId", result[0]);
            productStat.put("totalQuantity", result[1]);
            return productStat;
        }).collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getTopProductsByRevenue(String filter, int limit) {
        LocalDateTime[] dateRange = getDateRange(filter);
        List<Object[]> results = orderItemRepository.findTopProductsByRevenue(dateRange[0], dateRange[1], PageRequest.of(0, limit));
        
        return results.stream().map(result -> {
            Map<String, Object> stat = new HashMap<>();
            String name = (String) result[0];
            if (result[1] != null && result[1].toString().equalsIgnoreCase("HALF")) {
                name += " (Half)";
            }
            stat.put("product", name);
            stat.put("orders", result[2]);
            stat.put("revenue", result[3]);
            return stat;
        }).collect(Collectors.toList());
    }
}
