package com.omnistock.service;

import com.omnistock.dto.relatorio.ProdutoRankingDTO;
import com.omnistock.dto.relatorio.RelatorioLucroDTO;
import com.omnistock.enums.StatusPedido;
import com.omnistock.model.ItemPedidoVenda;
import com.omnistock.model.PedidoVenda;
import com.omnistock.repository.PedidoVendaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RelatorioService {

    private final PedidoVendaRepository pedidoVendaRepository;

    public RelatorioService(PedidoVendaRepository pedidoVendaRepository) {
        this.pedidoVendaRepository = pedidoVendaRepository;
    }

    @Transactional(readOnly = true)
    public RelatorioLucroDTO lucro() {
        List<PedidoVenda> confirmados = pedidoVendaRepository.findAllByOrderByDataDesc().stream()
                .filter(p -> p.getStatus() == StatusPedido.CONFIRMADO)
                .toList();

        BigDecimal totalVendas = BigDecimal.ZERO;
        BigDecimal totalCusto = BigDecimal.ZERO;

        for (PedidoVenda pedido : confirmados) {
            for (ItemPedidoVenda item : pedido.getItens()) {
                BigDecimal qtd = BigDecimal.valueOf(item.getQuantidade());
                totalVendas = totalVendas.add(item.getPrecoVenda().multiply(qtd));
                totalCusto = totalCusto.add(item.getProduto().getPrecoCusto().multiply(qtd));
            }
        }

        return new RelatorioLucroDTO(totalVendas, totalCusto, totalVendas.subtract(totalCusto), confirmados.size());
    }

    @Transactional(readOnly = true)
    public List<ProdutoRankingDTO> produtosMaisVendidos() {
        List<PedidoVenda> confirmados = pedidoVendaRepository.findAllByOrderByDataDesc().stream()
                .filter(p -> p.getStatus() == StatusPedido.CONFIRMADO)
                .toList();

        Map<Long, ProdutoRankingDTO> ranking = confirmados.stream()
                .flatMap(p -> p.getItens().stream())
                .collect(Collectors.toMap(
                        i -> i.getProduto().getId(),
                        i -> new ProdutoRankingDTO(i.getProduto().getId(), i.getProduto().getNome(), i.getQuantidade()),
                        (a, b) -> new ProdutoRankingDTO(a.produtoId(), a.produtoNome(), a.quantidadeVendida() + b.quantidadeVendida())
                ));

        return ranking.values().stream()
                .sorted(Comparator.comparingLong(ProdutoRankingDTO::quantidadeVendida).reversed())
                .toList();
    }
}
