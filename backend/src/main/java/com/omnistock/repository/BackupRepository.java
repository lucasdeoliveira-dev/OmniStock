package com.omnistock.repository;

import com.omnistock.model.Backup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BackupRepository extends JpaRepository<Backup, Long> {

    List<Backup> findAllByOrderByIniciadoEmDesc();

    List<Backup> findAllByStatusOrderByIniciadoEmDesc(String status);
}
