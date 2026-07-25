package com.friendscafe.repository;

import com.friendscafe.entity.Order;
import com.friendscafe.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();
    
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE LOWER(o.customer.name) LIKE LOWER(CONCAT('%', :customerName, '%')) OR o.customer.mobile LIKE CONCAT('%', :customerName, '%')")
    Page<Order> searchByCustomer(@Param("customerName") String customerName, Pageable pageable);

    // Analytics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    long countOrdersInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate AND o.status = 'COMPLETED'")
    Double sumRevenueInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    long countByStatus(OrderStatus status);

    @Query("SELECT o.status, COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate GROUP BY o.status")
    List<Object[]> countOrdersByStatusInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT TO_CHAR(created_at, 'HH24:00') as label, SUM(total_amount) as revenue FROM orders WHERE status = 'COMPLETED' AND created_at >= :startDate AND created_at <= :endDate GROUP BY TO_CHAR(created_at, 'HH24:00') ORDER BY label ASC", nativeQuery = true)
    List<Object[]> getHourlyRevenueTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as label, SUM(total_amount) as revenue FROM orders WHERE status = 'COMPLETED' AND created_at >= :startDate AND created_at <= :endDate GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD') ORDER BY label ASC", nativeQuery = true)
    List<Object[]> getDailyRevenueTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') as label, SUM(total_amount) as revenue FROM orders WHERE status = 'COMPLETED' AND created_at >= :startDate AND created_at <= :endDate GROUP BY DATE_TRUNC('week', created_at) ORDER BY DATE_TRUNC('week', created_at) ASC", nativeQuery = true)
    List<Object[]> getWeeklyRevenueTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as label, SUM(total_amount) as revenue FROM orders WHERE status = 'COMPLETED' AND created_at >= :startDate AND created_at <= :endDate GROUP BY DATE_TRUNC('month', created_at) ORDER BY DATE_TRUNC('month', created_at) ASC", nativeQuery = true)
    List<Object[]> getMonthlyRevenueTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
}
