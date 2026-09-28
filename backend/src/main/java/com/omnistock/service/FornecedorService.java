package com.omnistock.service;

import com.omnistock.dto.fornecedor.FornecedorRequestDTO;
import com.omnistock.dto.fornecedor.FornecedorResponseDTO;
import com.omnistock.model.Fornecedor;
import com.omnistock.repository.FornecedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listar() {
        return fornecedorRepository.findAll().stream().map(FornecedorResponseDTO::de).toList();
    }

    @Transactional
    public FornecedorResponseDTO criar(FornecedorRequestDTO dto) {
        Fornecedor f = new Fornecedor();
        f.setNome(dto.nome());
        f.setCnpj(dto.cnpj());
        f.setContato(dto.contato());
        f.setEmail(dto.email());
        return FornecedorResponseDTO.de(fornecedorRepository.save(f));
    }
}
