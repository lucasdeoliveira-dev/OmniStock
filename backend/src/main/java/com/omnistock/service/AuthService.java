package com.omnistock.service;

import com.omnistock.dto.auth.TokenResponseDTO;
import com.omnistock.model.Usuario;
import com.omnistock.repository.UsuarioRepository;
import com.omnistock.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                        UsuarioRepository usuarioRepository,
                        JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public TokenResponseDTO autenticar(String email, String senha) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, senha));

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Usuário autenticado não encontrado"));

        String token = jwtTokenProvider.gerarToken(usuario.getEmail(), usuario.getRole().name());

        return new TokenResponseDTO(token, usuario.getNome(), usuario.getEmail(), usuario.getRole().name());
    }
}
