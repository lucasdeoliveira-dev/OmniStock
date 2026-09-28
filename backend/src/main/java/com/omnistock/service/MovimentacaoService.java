package com.omnistock.service;

import com.omnistock.dto.movimentacao.MovimentacaoRequestDTO;
import com.omnistock.dto.movimentacao.MovimentacaoResponseDTO;
import com.omnistock.enums.TipoMovimentacao;
import com.omnistock.exception.BusinessException;
import com.omnistock.exception.ResourceNotFoundException;
import com.omnistock.model.Movimentacao;
import com.omnistock.model.Produto;
import com.omnistock.repository.MovimentacaoRepository;
import com.omnistock.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;

    public MovimentacaoService(MovimentacaoRepository movimentacaoRepository, ProdutoRepository produtoRepository) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoRepository = produtoRepository;
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponseDTO> listar() {
        return movimentacaoRepository.findAllByOrderByDataDesc().stream()
                .map(MovimentacaoResponseDTO::de)
                .toList();
    }

    @Transactional
    public MovimentacaoResponseDTO registrar(MovimentacaoRequestDTO dto) {
        Produto produto = produtoRepository.findById(dto.produtoId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + dto.produtoId()));

        return MovimentacaoResponseDTO.de(aplicar(produto, dto.tipo(), dto.quantidade(), dto.motivo()));
    }

    @Transactional
    public Movimentacao aplicar(Produto produto, TipoMovimentacao tipo, int quantidade, String motivo) {
        if (tipo == TipoMovimentacao.SAIDA && produto.getQuantidade() < quantidade) {
            throw new BusinessException("Estoque insuficiente para: " + produto.getNome());
        }

        produto.setQuantidade(tipo == TipoMovimentacao.ENTRADA
                ? produto.getQuantidade() + quantidade
                : produto.getQuantidade() - quantidade);
        produtoRepository.save(produto);

        return movimentacaoRepository.save(new Movimentacao(produto, tipo, quantidade, motivo));
    }
}
