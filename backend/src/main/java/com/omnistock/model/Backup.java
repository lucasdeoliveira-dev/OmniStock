package com.omnistock.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "backups")
@Getter
@Setter
@NoArgsConstructor
public class Backup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String arquivo;

    private String caminho;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(nullable = false)
    private boolean criptografado;

    @Column(nullable = false)
    private boolean compactado;

    private String status;

    private String mensagem;

    @Column(name = "etapa_atual")
    private String etapaAtual;

    @Column(columnDefinition = "TEXT")
    private String log;

    @ManyToOne
    @JoinColumn(name = "manutencao_id")
    private Manutencao manutencao;

    @Column(name = "log_enviado_email", nullable = false)
    private boolean logEnviadoEmail;

    @Column(name = "iniciado_em", nullable = false)
    private LocalDateTime iniciadoEm;

    @Column(name = "finalizado_em")
    private LocalDateTime finalizadoEm;
}
