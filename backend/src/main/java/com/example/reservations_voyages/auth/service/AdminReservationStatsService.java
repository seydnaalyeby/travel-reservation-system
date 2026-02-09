package com.example.reservations_voyages.auth.service;

import com.example.reservations_voyages.auth.dto.*;
import com.example.reservations_voyages.user.repo.AdminStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReservationStatsService {

    private final AdminStatsRepository repo;

    public AdminReservationStatsResponse stats(LocalDate from, LocalDate to) {
        // inclusif -> exclusif (fin du jour)
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.plusDays(1).atTime(LocalTime.MIDNIGHT);

        long total = repo.totalCount(fromDt, toDt);
        long volCount = repo.volCount(fromDt, toDt);
        long hotelCount = repo.hotelCount(fromDt, toDt);

        long pending = repo.pendingCount(fromDt, toDt);
        long confirmed = repo.confirmedCount(fromDt, toDt);
        long canceled = repo.canceledCount(fromDt, toDt);

        double cancelRate = total == 0 ? 0.0 : (canceled * 100.0) / total;

        BigDecimal revenue = repo.revenueConfirmedTotal(fromDt, toDt);

        // monthly
        List<MonthPoint> monthly = repo.monthly(fromDt, toDt).stream().map(r -> {
            String month = (String) r[0];
            long cnt = ((Number) r[1]).longValue();
            BigDecimal rev = (BigDecimal) r[2];
            return MonthPoint.builder().month(month).count(cnt).revenue(rev).build();
        }).toList();

        // byType / byStatus
        List<LabelValue> byType = List.of(
                LabelValue.builder().label("VOL").value(volCount).build(),
                LabelValue.builder().label("HOTEL").value(hotelCount).build()
        );

        List<LabelValue> byStatus = List.of(
                LabelValue.builder().label("PENDING_PAYMENT").value(pending).build(),
                LabelValue.builder().label("CONFIRMED").value(confirmed).build(),
                LabelValue.builder().label("CANCELED").value(canceled).build()
        );

        // top clients
        List<TopClientRow> topClients = repo.topClients(fromDt, toDt).stream().map(r -> {
            Long clientId = ((Number) r[0]).longValue();
            String name = (String) r[1];
            String email = (String) r[2];
            long cnt = ((Number) r[3]).longValue();
            BigDecimal rev = (BigDecimal) r[4];
            return TopClientRow.builder()
                    .clientId(clientId)
                    .clientName(name)
                    .clientEmail(email)
                    .reservationsCount(cnt)
                    .revenueConfirmed(rev)
                    .build();
        }).toList();

        // top vols / hotels (label simple = id pour l’instant)
        List<TopItemRow> topVols = repo.topVols(fromDt, toDt).stream().map(r -> {
            Long id = ((Number) r[0]).longValue();
            long cnt = ((Number) r[1]).longValue();
            return TopItemRow.builder().itemId(id).label("VOL #" + id).count(cnt).build();
        }).toList();

        List<TopItemRow> topHotels = repo.topHotels(fromDt, toDt).stream().map(r -> {
            Long id = ((Number) r[0]).longValue();
            long cnt = ((Number) r[1]).longValue();
            return TopItemRow.builder().itemId(id).label("HOTEL #" + id).count(cnt).build();
        }).toList();

        return AdminReservationStatsResponse.builder()
                .totalCount(total)
                .volCount(volCount)
                .hotelCount(hotelCount)
                .pendingCount(pending)
                .confirmedCount(confirmed)
                .canceledCount(canceled)
                .cancelRatePercent(cancelRate)
                .revenueConfirmedTotal(revenue)
                .monthly(monthly)
                .byType(byType)
                .byStatus(byStatus)
                .topClients(topClients)
                .topVols(topVols)
                .topHotels(topHotels)
                .build();
    }
}
