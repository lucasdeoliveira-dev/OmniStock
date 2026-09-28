package com.omnistock.controller;

import com.omnistock.dto.pedido.PedidoCompraRequestDTO;
import com.omnistock.dto.pedido.PedidoCompraResponseDTO;
import com.omnistock.service.PedidoCompraService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos-compra")
public class PedidoCompraController {

    private final PedidoCompraService pedidoCompraService;

    public PedidoCompraController(PedidoCompraService pedidoCompraService) {
        this.pedidoCompraService = pedidoCompraService;
    }

    @GetMapping
    public ResponseEntity<List<PedidoCompraResponseDTO>> listar() {
        return ResponseEntity.ok(pedidoCompraService.listar());
    }

    @PostMapping
    public ResponseEntity<PedidoCompraResponseDTO> criar(@Valid @RequestBody PedidoCompraRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoCompraService.criar(dto));
    }

    @PostMapping("/{id}/receber")
    public ResponseEntity<PedidoCompraResponseDTO> receber(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoCompraService.receber(id));
    }
}
