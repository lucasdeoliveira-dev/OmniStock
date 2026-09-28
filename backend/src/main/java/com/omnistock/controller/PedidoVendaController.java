package com.omnistock.controller;

import com.omnistock.dto.pedido.PedidoVendaRequestDTO;
import com.omnistock.dto.pedido.PedidoVendaResponseDTO;
import com.omnistock.service.PedidoVendaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos-venda")
public class PedidoVendaController {

    private final PedidoVendaService pedidoVendaService;

    public PedidoVendaController(PedidoVendaService pedidoVendaService) {
        this.pedidoVendaService = pedidoVendaService;
    }

    @GetMapping
    public ResponseEntity<List<PedidoVendaResponseDTO>> listar() {
        return ResponseEntity.ok(pedidoVendaService.listar());
    }

    @PostMapping
    public ResponseEntity<PedidoVendaResponseDTO> criar(@Valid @RequestBody PedidoVendaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoVendaService.criar(dto));
    }

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<PedidoVendaResponseDTO> confirmar(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoVendaService.confirmar(id));
    }
}
