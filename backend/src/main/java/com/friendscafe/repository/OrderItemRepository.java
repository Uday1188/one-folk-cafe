package com.friendscafe.repository;

import com.friendscafe.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalQuantity FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.status = 'COMPLETED' " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "GROUP BY oi.product.id ORDER BY totalQuantity DESC")
    List<Object[]> findTopSellingProducts(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT p.name, oi.servingType, COUNT(DISTINCT o.id), SUM(oi.quantity * oi.price), SUM(oi.quantity) FROM OrderItem oi " +
           "JOIN oi.order o JOIN oi.product p " +
           "WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "GROUP BY p.name, oi.servingType ORDER BY SUM(oi.quantity * oi.price) DESC")
    List<Object[]> findTopProductsByRevenue(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
}
