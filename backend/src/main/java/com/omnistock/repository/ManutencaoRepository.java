package com.omnistock.repository;

import com.omnistock.model.Manutencao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ManutencaoRepository extends JpaRepository<Manutencao, Long> {

    List<Manutencao> findAllByOrderByIniciadoEmDesc();

    Optional<Manutencao> findFirstByStatusOrderByIniciadoEmDesc(String status);
}
