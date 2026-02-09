package com.example.reservations_voyages.user.repo;

import com.example.reservations_voyages.user.entity.ReservationVol;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface AdminStatsRepository extends Repository<ReservationVol, Long> {

    // ===== GLOBAL COUNTS =====
    @Query(value = """
        select
          (select count(*) from reservation_vols where created_at between :from and :to) +
          (select count(*) from reservation_hotels where created_at between :from and :to) as total
        """, nativeQuery = true)
    long totalCount(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "select count(*) from reservation_vols where created_at between :from and :to", nativeQuery = true)
    long volCount(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "select count(*) from reservation_hotels where created_at between :from and :to", nativeQuery = true)
    long hotelCount(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ===== STATUS COUNTS =====
    @Query(value = """
        select
          (select count(*) from reservation_vols where status='PENDING_PAYMENT' and created_at between :from and :to) +
          (select count(*) from reservation_hotels where status='PENDING_PAYMENT' and created_at between :from and :to)
        """, nativeQuery = true)
    long pendingCount(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = """
        select
          (select count(*) from reservation_vols where status='CONFIRMED' and created_at between :from and :to) +
          (select count(*) from reservation_hotels where status='CONFIRMED' and created_at between :from and :to)
        """, nativeQuery = true)
    long confirmedCount(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = """
        select
          (select count(*) from reservation_vols where status='CANCELED' and created_at between :from and :to) +
          (select count(*) from reservation_hotels where status='CANCELED' and created_at between :from and :to)
        """, nativeQuery = true)
    long canceledCount(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ===== REVENUE CONFIRMED TOTAL =====
    @Query(value = """
        select
          coalesce((select sum(total_price) from reservation_vols where status='CONFIRMED' and created_at between :from and :to), 0) +
          coalesce((select sum(total_price) from reservation_hotels where status='CONFIRMED' and created_at between :from and :to), 0)
        """, nativeQuery = true)
    BigDecimal revenueConfirmedTotal(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ===== MONTHLY (COUNT + REVENUE) =====
    @Query(value = """
      with all_res as (
        select date_trunc('month', created_at) as m, total_price, status
        from reservation_vols where created_at between :from and :to
        union all
        select date_trunc('month', created_at) as m, total_price, status
        from reservation_hotels where created_at between :from and :to
      )
      select
        to_char(m, 'YYYY-MM') as month,
        count(*) as cnt,
        coalesce(sum(case when status='CONFIRMED' then total_price else 0 end), 0) as revenue
      from all_res
      group by m
      order by m
    """, nativeQuery = true)
    List<Object[]> monthly(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ===== TOP 5 CLIENTS =====
    @Query(value = """
      with all_res as (
        select client_id, total_price, status, created_at from reservation_vols where created_at between :from and :to
        union all
        select client_id, total_price, status, created_at from reservation_hotels where created_at between :from and :to
      )
      select
        u.id as client_id,
        u.full_name,
        u.email,
        count(*) as cnt,
        coalesce(sum(case when ar.status='CONFIRMED' then ar.total_price else 0 end), 0) as revenue
      from all_res ar
      join users u on u.id = ar.client_id
      group by u.id, u.full_name, u.email
      order by cnt desc, revenue desc
      limit 5
    """, nativeQuery = true)
    List<Object[]> topClients(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ===== TOP VOLS =====
    @Query(value = """
      select vol_id, count(*) as cnt
      from reservation_vols
      where created_at between :from and :to
      group by vol_id
      order by cnt desc
      limit 5
    """, nativeQuery = true)
    List<Object[]> topVols(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ===== TOP HOTELS =====
    @Query(value = """
      select hotel_id, count(*) as cnt
      from reservation_hotels
      where created_at between :from and :to
      group by hotel_id
      order by cnt desc
      limit 5
    """, nativeQuery = true)
    List<Object[]> topHotels(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
