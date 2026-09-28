package com.omnistock.controller;

import com.omnistock.dto.manutencao.ManutencaoRequestDTO;
import com.omnistock.dto.manutencao.ManutencaoResponseDTO;
import com.omnistock.service.ManutencaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manutencao")
public class ManutencaoController {

    private final ManutencaoService manutencaoService;

    public ManutencaoController(ManutencaoService manutencaoService) {
        this.manutencaoService = manutencaoService;
    }

    @GetMapping("/historico")
    public ResponseEntity<List<ManutencaoResponseDTO>> historico() {
        return ResponseEntity.ok(manutencaoService.listarHistorico());
    }

    @PostMapping
    public ResponseEntity<ManutencaoResponseDTO> executar(@RequestBody ManutencaoRequestDTO dto) {
        return ResponseEntity.ok(ManutencaoResponseDTO.de(manutencaoService.executar(dto.escolhaManual())));
    }
}
