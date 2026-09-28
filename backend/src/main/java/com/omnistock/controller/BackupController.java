package com.omnistock.controller;

import com.omnistock.dto.backup.*;
import com.omnistock.service.BackupService;
import com.omnistock.service.RestoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private final BackupService backupService;
    private final RestoreService restoreService;

    public BackupController(BackupService backupService, RestoreService restoreService) {
        this.backupService = backupService;
        this.restoreService = restoreService;
    }

    @GetMapping("/historico")
    public ResponseEntity<List<BackupResponseDTO>> historico() {
        return ResponseEntity.ok(backupService.listarHistorico());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BackupResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(backupService.buscarPorId(id));
    }

    @GetMapping(value = "/{id}/log", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> log(@PathVariable Long id) {
        return ResponseEntity.ok(backupService.buscarLog(id));
    }

    @GetMapping("/testar-conexao")
    public ResponseEntity<TesteConexaoResponseDTO> testarConexao() {
        return ResponseEntity.ok(backupService.testarConexao());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @PostMapping
    public ResponseEntity<BackupResponseDTO> iniciar(@Valid @RequestBody BackupRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(backupService.iniciar(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @PostMapping("/{id}/restaurar")
    public ResponseEntity<RestoreResponseDTO> restaurar(@PathVariable Long id, @Valid @RequestBody RestoreRequestDTO dto) {
        return ResponseEntity.ok(restoreService.restaurar(id, dto.senha()));
    }
}
