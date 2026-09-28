package com.omnistock.service;

import com.omnistock.dto.pedido.PedidoVendaRequestDTO;
import com.omnistock.dto.pedido.PedidoVendaResponseDTO;
import com.omnistock.enums.StatusPedido;
import com.omnistock.enums.TipoMovimentacao;
import com.omnistock.exception.BusinessException;
import com.omnistock.exception.ResourceNotFoundException;
import com.omnistock.model.Cliente;
import com.omnistock.model.ItemPedidoVenda;
import com.omnistock.model.PedidoVenda;
import com.omnistock.model.Produto;
import com.omnistock.repository.ClienteRepository;
import com.omnistock.repository.PedidoVendaRepository;
import com.omnistock.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PedidoVendaService {

    private final PedidoVendaRepository pedidoVendaRepository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;
    private final MovimentacaoService movimentacaoService;

    public PedidoVendaService(PedidoVendaRepository pedidoVendaRepository,
                               ClienteRepository clienteRepository,
                               ProdutoRepository produtoRepository,
                               MovimentacaoService movimentacaoService) {
        this.pedidoVendaRepository = pedidoVendaRepository;
        this.clienteRepository = clienteRepository;
        this.produtoRepository = produtoRepository;
        this.movimentacaoService = movimentacaoService;
    }

    @Transactional(readOnly = true)
    public List<PedidoVendaResponseDTO> listar() {
        return pedidoVendaRepository.findAllByOrderByDataDesc().stream()
                .map(PedidoVendaResponseDTO::de)
                .toList();
    }

    @Transactional
    public PedidoVendaResponseDTO criar(PedidoVendaRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + dto.clienteId()));

        PedidoVenda pedido = new PedidoVenda();
        pedido.setCliente(cliente);
        pedido.setStatus(StatusPedido.PENDENTE);

        dto.itens().forEach(itemDto -> {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + itemDto.produtoId()));

            ItemPedidoVenda item = new ItemPedidoVenda();
            item.setPedidoVenda(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());
            item.setPrecoVenda(itemDto.precoVenda());
            pedido.getItens().add(item);
        });

        return PedidoVendaResponseDTO.de(pedidoVendaRepository.save(pedido));
    }

    @Transactional
    public PedidoVendaResponseDTO confirmar(Long pedidoId) {
        PedidoVenda pedido = pedidoVendaRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado: " + pedidoId));

        if (pedido.getStatus() != StatusPedido.PENDENTE) {
            throw new BusinessException("Pedido já foi processado.");
        }

        pedido.getItens().forEach(item -> movimentacaoService.aplicar(
                item.getProduto(), TipoMovimentacao.SAIDA, item.getQuantidade(),
                "Confirmação do pedido de venda #" + pedido.getId()
        ));

        pedido.setStatus(StatusPedido.CONFIRMADO);
        return PedidoVendaResponseDTO.de(pedido);
    }
}
