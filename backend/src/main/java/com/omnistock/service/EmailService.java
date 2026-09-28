package com.omnistock.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Simula o envio de e-mail (não há servidor SMTP configurado no ambiente controlado do trabalho).
 * A "prova de envio" é um arquivo .txt gravado em disco com o conteúdo que seria enviado.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @Value("${omnistock.backup.dir:/app/backups}")
    private String backupDir;

    @Value("${omnistock.email.destinatario:admin@omnistock.com}")
    private String destinatario;

    public boolean simularEnvioLogFalha(Long backupId, String assunto, String corpo) {
        try {
            Path pastaEmails = Path.of(backupDir, "emails");
            Files.createDirectories(pastaEmails);

            String nomeArquivo = "email_backup_" + backupId + "_" + LocalDateTime.now().format(TIMESTAMP) + ".txt";
            String conteudo = "Para: " + destinatario + "\nAssunto: " + assunto + "\n\n" + corpo;

            Files.writeString(pastaEmails.resolve(nomeArquivo), conteudo);
            log.info("[SIMULACAO DE E-MAIL] Enviado para {} sobre backup #{} (arquivo: {})", destinatario, backupId, nomeArquivo);
            return true;
        } catch (IOException e) {
            log.warn("Falha ao simular envio de e-mail para backup #{}: {}", backupId, e.getMessage());
            return false;
        }
    }
}
