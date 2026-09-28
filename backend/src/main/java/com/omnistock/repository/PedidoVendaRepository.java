package com.omnistock.repository;

import com.omnistock.model.PedidoVenda;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PedidoVendaRepository extends JpaRepository<PedidoVenda, Long> {

    @EntityGraph(attributePaths = {"cliente", "itens", "itens.produto"})
    List<PedidoVenda> findAllByOrderByDataDesc();

    @EntityGraph(attributePaths = {"cliente", "itens", "itens.produto"})
    Optional<PedidoVenda> findById(Long id);
}
