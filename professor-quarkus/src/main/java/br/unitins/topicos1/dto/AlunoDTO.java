package br.unitins.topicos1.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlunoDTO(
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    String nome,
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    String email,
    
    @NotBlank(message = "Username é obrigatório")
    @Size(min = 3, max = 50, message = "Username deve ter entre 3 e 50 caracteres")
    String username,
    
    String senha,
    
    LocalDate dataNascimento,
    
    TelefoneDTO telefone,
    
    TelefoneDTO telefoneResponsavel,
    
    // Compatibilidade: turma única
    Long idTurma,
    
    // Novo: múltiplas turmas
    List<Long> idsTurmas
) {}
