package com.friendscafe.specification;

import com.friendscafe.entity.Order;
import com.friendscafe.entity.OrderStatus;
import com.friendscafe.entity.PaymentStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    public static Specification<Order> getOrdersByCriteria(
            OrderStatus status, 
            PaymentStatus paymentStatus,
            String tableNumber, 
            String search, 
            LocalDateTime startDate, 
            LocalDateTime endDate) {
            
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (paymentStatus != null) {
                predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus));
            }

            if (tableNumber != null && !tableNumber.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("tableNumber"), tableNumber));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate customerNamePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.join("customer").get("name")), searchPattern);
                Predicate customerMobilePredicate = criteriaBuilder.like(root.join("customer").get("mobile"), searchPattern);
                predicates.add(criteriaBuilder.or(customerNamePredicate, customerMobilePredicate));
            }

            if (startDate != null && endDate != null) {
                predicates.add(criteriaBuilder.between(root.get("createdAt"), startDate, endDate));
            } else if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            } else if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
