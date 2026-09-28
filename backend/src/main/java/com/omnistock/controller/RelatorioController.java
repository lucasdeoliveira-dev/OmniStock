package com.omnistock.controller;

import com.omnistock.dto.relatorio.ProdutoRankingDTO;
import com.omnistock.dto.relatorio.RelatorioLucroDTO;
import com.omnistock.service.RelatorioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/lucro")
    public ResponseEntity<RelatorioLucroDTO> lucro() {
        return ResponseEntity.ok(relatorioService.lucro());
    }

    @GetMapping("/mais-vendidos")
    public ResponseEntity<List<ProdutoRankingDTO>> maisVendidos() {
        return ResponseEntity.ok(relatorioService.produtosMaisVendidos());
    }
}
