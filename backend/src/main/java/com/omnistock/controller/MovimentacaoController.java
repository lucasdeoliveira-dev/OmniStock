package com.omnistock.controller;

import com.omnistock.dto.movimentacao.MovimentacaoRequestDTO;
import com.omnistock.dto.movimentacao.MovimentacaoResponseDTO;
import com.omnistock.service.MovimentacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    }

    @GetMapping
    public ResponseEntity<List<MovimentacaoResponseDTO>> listar() {
        return ResponseEntity.ok(movimentacaoService.listar());
    }

    @PostMapping
    public ResponseEntity<MovimentacaoResponseDTO> registrar(@Valid @RequestBody MovimentacaoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movimentacaoService.registrar(dto));
    }
}
