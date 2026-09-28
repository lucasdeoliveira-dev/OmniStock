package com.omnistock.service;

import com.omnistock.dto.cliente.ClienteRequestDTO;
import com.omnistock.dto.cliente.ClienteResponseDTO;
import com.omnistock.model.Cliente;
import com.omnistock.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listar() {
        return clienteRepository.findAll().stream().map(ClienteResponseDTO::de).toList();
    }

    @Transactional
    public ClienteResponseDTO criar(ClienteRequestDTO dto) {
        Cliente c = new Cliente();
        c.setNome(dto.nome());
        c.setDocumento(dto.documento());
        c.setEmail(dto.email());
        c.setTelefone(dto.telefone());
        return ClienteResponseDTO.de(clienteRepository.save(c));
    }
}
