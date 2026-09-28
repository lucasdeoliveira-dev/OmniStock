package com.omnistock.service;

import com.omnistock.dto.manutencao.ManutencaoResponseDTO;
import com.omnistock.enums.OrigemDecisao;
import com.omnistock.enums.TipoManutencao;
import com.omnistock.model.Manutencao;
import com.omnistock.repository.ManutencaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class ManutencaoService {

    private final ManutencaoRepository manutencaoRepository;
    private final DataSource dataSource;

    public ManutencaoService(ManutencaoRepository manutencaoRepository, DataSource dataSource) {
        this.manutencaoRepository = manutencaoRepository;
        this.dataSource = dataSource;
    }

    @Transactional(readOnly = true)
    public List<ManutencaoResponseDTO> listarHistorico() {
        return manutencaoRepository.findAllByOrderByIniciadoEmDesc().stream()
                .map(ManutencaoResponseDTO::de)
                .toList();
    }

    /**
     * Decide o tipo de manutenção a ser aplicado. Uma escolha manual (não nula) sempre
     * prevalece sobre a decisão automática baseada na data da última manutenção.
     */
    public TipoManutencao decidir(TipoManutencao escolhaManual) {
        if (escolhaManual != null) {
            return escolhaManual;
        }

        Optional<Manutencao> ultima = manutencaoRepository.findFirstByStatusOrderByIniciadoEmDesc("SUCESSO");
        if (ultima.isEmpty()) {
            return TipoManutencao.VACUUM_FULL_ANALYZE;
        }

        long dias = ChronoUnit.DAYS.between(ultima.get().getIniciadoEm(), LocalDateTime.now());
        if (dias < 30) {
            return TipoManutencao.NENHUMA;
        }
        if (dias <= 60) {
            return TipoManutencao.VACUUM;
        }
        return TipoManutencao.VACUUM_FULL_ANALYZE;
    }

    public String descreverRegra(TipoManutencao escolhaManual) {
        if (escolhaManual != null) {
            return "Escolha explícita do usuário (prevalece sobre decisão automática).";
        }

        Optional<Manutencao> ultima = manutencaoRepository.findFirstByStatusOrderByIniciadoEmDesc("SUCESSO");
        if (ultima.isEmpty()) {
            return "Nenhuma manutenção anterior registrada -> VACUUM FULL ANALYZE.";
        }

        long dias = ChronoUnit.DAYS.between(ultima.get().getIniciadoEm(), LocalDateTime.now());
        if (dias < 30) {
            return "Última manutenção há " + dias + " dias (<30) -> não executar.";
        }
        if (dias <= 60) {
            return "Última manutenção há " + dias + " dias (30-60) -> VACUUM.";
        }
        return "Última manutenção há " + dias + " dias (>60) -> VACUUM FULL ANALYZE.";
    }

    /**
     * Executa a manutenção decidida (ou a escolha manual) e registra o resultado.
     * VACUUM não pode rodar dentro de uma transação JPA, por isso usa uma conexão JDBC direta.
     */
    public Manutencao executar(TipoManutencao escolhaManual) {
        TipoManutencao tipo = decidir(escolhaManual);
        String regra = descreverRegra(escolhaManual);

        Manutencao manutencao = new Manutencao();
        manutencao.setTipo(tipo);
        manutencao.setOrigem(escolhaManual != null ? OrigemDecisao.MANUAL : OrigemDecisao.AUTOMATICA);
        manutencao.setRegraAplicada(regra);
        manutencao.setIniciadoEm(LocalDateTime.now());

        if (tipo == TipoManutencao.NENHUMA) {
            manutencao.setStatus("SUCESSO");
            manutencao.setMensagem("Manutenção não necessária no momento.");
            manutencao.setFinalizadoEm(LocalDateTime.now());
            return manutencaoRepository.save(manutencao);
        }

        String comando = tipo == TipoManutencao.VACUUM_FULL_ANALYZE ? "VACUUM FULL ANALYZE" : "VACUUM";

        try (Connection conexao = dataSource.getConnection()) {
            conexao.setAutoCommit(true);
            try (Statement statement = conexao.createStatement()) {
                statement.execute(comando);
            }
            manutencao.setStatus("SUCESSO");
            manutencao.setMensagem(comando + " executado com sucesso.");
        } catch (Exception e) {
            manutencao.setStatus("FALHA");
            manutencao.setMensagem("Falha ao executar " + comando + ": " + e.getMessage());
        } finally {
            manutencao.setFinalizadoEm(LocalDateTime.now());
        }

        return manutencaoRepository.save(manutencao);
    }
}
