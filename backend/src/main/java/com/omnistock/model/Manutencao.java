package com.omnistock.model;

import com.omnistock.enums.OrigemDecisao;
import com.omnistock.enums.TipoManutencao;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "manutencoes")
@Getter
@Setter
@NoArgsConstructor
public class Manutencao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoManutencao tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrigemDecisao origem;

    @Column(name = "regra_aplicada", nullable = false)
    private String regraAplicada;

    @Column(nullable = false)
    private String status;

    private String mensagem;

    @Column(name = "iniciado_em", nullable = false)
    private LocalDateTime iniciadoEm;

    @Column(name = "finalizado_em")
    private LocalDateTime finalizadoEm;
}
