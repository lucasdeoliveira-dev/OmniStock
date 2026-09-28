package com.omnistock.service;

import com.omnistock.dto.produto.ProdutoRequestDTO;
import com.omnistock.dto.produto.ProdutoResponseDTO;
import com.omnistock.exception.ResourceNotFoundException;
import com.omnistock.model.Categoria;
import com.omnistock.model.Produto;
import com.omnistock.repository.CategoriaRepository;
import com.omnistock.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProdutoService(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listar() {
        return produtoRepository.findAll().stream()
                .map(ProdutoResponseDTO::de)
                .toList();
    }

    @Transactional
    public ProdutoResponseDTO criar(ProdutoRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + dto.categoriaId()));

        Produto produto = new Produto();
        produto.setNome(dto.nome());
        produto.setSku(dto.sku());
        produto.setCategoria(categoria);
        produto.setQuantidade(dto.quantidade());
        produto.setPrecoCusto(dto.precoCusto());
        produto.setPrecoVenda(dto.precoVenda());
        produto.setEstoqueMinimo(dto.estoqueMinimo());

        return ProdutoResponseDTO.de(produtoRepository.save(produto));
    }
}
