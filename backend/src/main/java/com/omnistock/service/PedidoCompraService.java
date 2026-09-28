package com.omnistock.service;

import com.omnistock.dto.pedido.PedidoCompraRequestDTO;
import com.omnistock.dto.pedido.PedidoCompraResponseDTO;
import com.omnistock.enums.StatusPedido;
import com.omnistock.enums.TipoMovimentacao;
import com.omnistock.exception.BusinessException;
import com.omnistock.exception.ResourceNotFoundException;
import com.omnistock.model.Fornecedor;
import com.omnistock.model.ItemPedidoCompra;
import com.omnistock.model.PedidoCompra;
import com.omnistock.model.Produto;
import com.omnistock.repository.FornecedorRepository;
import com.omnistock.repository.PedidoCompraRepository;
import com.omnistock.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PedidoCompraService {

    private final PedidoCompraRepository pedidoCompraRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final MovimentacaoService movimentacaoService;

    public PedidoCompraService(PedidoCompraRepository pedidoCompraRepository,
                                FornecedorRepository fornecedorRepository,
                                ProdutoRepository produtoRepository,
                                MovimentacaoService movimentacaoService) {
        this.pedidoCompraRepository = pedidoCompraRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.produtoRepository = produtoRepository;
        this.movimentacaoService = movimentacaoService;
    }

    @Transactional(readOnly = true)
    public List<PedidoCompraResponseDTO> listar() {
        return pedidoCompraRepository.findAllByOrderByDataDesc().stream()
                .map(PedidoCompraResponseDTO::de)
                .toList();
    }

    @Transactional
    public PedidoCompraResponseDTO criar(PedidoCompraRequestDTO dto) {
        Fornecedor fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado: " + dto.fornecedorId()));

        PedidoCompra pedido = new PedidoCompra();
        pedido.setFornecedor(fornecedor);
        pedido.setStatus(StatusPedido.PENDENTE);

        dto.itens().forEach(itemDto -> {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + itemDto.produtoId()));

            ItemPedidoCompra item = new ItemPedidoCompra();
            item.setPedidoCompra(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());
            item.setPrecoCusto(itemDto.precoCusto());
            pedido.getItens().add(item);
        });

        return PedidoCompraResponseDTO.de(pedidoCompraRepository.save(pedido));
    }

    @Transactional
    public PedidoCompraResponseDTO receber(Long pedidoId) {
        PedidoCompra pedido = pedidoCompraRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado: " + pedidoId));

        if (pedido.getStatus() != StatusPedido.PENDENTE) {
            throw new BusinessException("Pedido já foi processado.");
        }

        pedido.getItens().forEach(item -> movimentacaoService.aplicar(
                item.getProduto(), TipoMovimentacao.ENTRADA, item.getQuantidade(),
                "Recebimento do pedido de compra #" + pedido.getId()
        ));

        pedido.setStatus(StatusPedido.RECEBIDO);
        return PedidoCompraResponseDTO.de(pedido);
    }
}
