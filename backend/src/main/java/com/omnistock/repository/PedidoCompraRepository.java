package com.omnistock.repository;

import com.omnistock.model.PedidoCompra;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PedidoCompraRepository extends JpaRepository<PedidoCompra, Long> {

    @EntityGraph(attributePaths = {"fornecedor", "itens", "itens.produto"})
    List<PedidoCompra> findAllByOrderByDataDesc();

    @EntityGraph(attributePaths = {"fornecedor", "itens", "itens.produto"})
    Optional<PedidoCompra> findById(Long id);
}
